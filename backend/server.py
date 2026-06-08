from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import base64
import asyncio
import logging
import time
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging FIRST so logger is available for module-level logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
SENDER_NAME = os.environ.get('SENDER_NAME', 'Nicole')
LEAD_RECIPIENT_EMAIL = os.environ.get('LEAD_RECIPIENT_EMAIL', 'kaziubaid05@gmail.com')
REDIRECT_URL = os.environ.get(
    'REDIRECT_URL',
    'https://www.your-creatory.com/serger-overlocker-course-and-sewing-lessons/?aff=kazi200',
)
EBOOK_PATH = os.environ.get('EBOOK_PATH', str(ROOT_DIR / 'assets' / 'sewing_roadmap.pdf'))
EBOOK_DOWNLOAD_URL = os.environ.get(
    'EBOOK_DOWNLOAD_URL',
    'https://customer-assets.emergentagent.com/job_dress-roadmap-optin/artifacts/feb7rauq_Lead%20Magnet%20%281%29.pdf',
)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    logger.error('RESEND_API_KEY is not configured')

# MongoDB connection (used for duplicate-submission tracking only)
try:
    mongo_url = os.environ['MONGO_URL']
    mongo_client = AsyncIOMotorClient(mongo_url)
    db = mongo_client[os.environ['DB_NAME']]
    leads_col = db['leads_dedup']
except Exception as e:
    logger.error(f'Mongo init failed: {e}')
    leads_col = None

# Load ebook PDF (base64) at startup so we don't re-read on each request
EBOOK_B64: str | None = None
EBOOK_FILENAME = 'Beginners-Sewing-Roadmap.pdf'
try:
    if os.path.exists(EBOOK_PATH):
        with open(EBOOK_PATH, 'rb') as fh:
            EBOOK_B64 = base64.b64encode(fh.read()).decode('utf-8')
        logger.info(f'Ebook loaded for attachment: {EBOOK_PATH} ({len(EBOOK_B64)} b64 chars)')
    else:
        logger.warning(f'Ebook file not found at {EBOOK_PATH}; attachment will be skipped')
except Exception as e:
    logger.error(f'Failed to load ebook PDF: {e}')

# Simple in-memory rate limiter (per IP) and dedupe cache
_RATE_BUCKET: dict[str, list[float]] = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 5  # max submissions per IP per window

app = FastAPI(title="Sewing Roadmap Lead Capture")
api_router = APIRouter(prefix="/api")


# ----- Models -----
class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=4, max_length=40)


class LeadResponse(BaseModel):
    status: str
    redirect_url: str
    subscriber_email_id: str | None = None
    admin_email_id: str | None = None


# ----- Email templates -----
def build_subscriber_email_html(name: str, download_url: str) -> str:
    safe_name = (name or 'there').strip() or 'there'
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6F8;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#222222;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border-radius:18px;padding:36px 32px;box-shadow:0 8px 24px -12px rgba(255,45,120,0.25);">
            <tr>
              <td style="font-size:12px;color:#FF2D78;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Free Sewing Ebook</td>
            </tr>
            <tr>
              <td style="font-size:24px;font-weight:800;color:#222222;padding:6px 0 16px;line-height:1.2;">
                Hi {safe_name}, your free sewing roadmap is here 🧵
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#444444;line-height:1.55;padding-bottom:14px;">
                Thank you for requesting your free copy of:
              </td>
            </tr>
            <tr>
              <td style="font-size:17px;font-weight:700;color:#FF2D78;padding-bottom:18px;line-height:1.35;">
                Beginner's Roadmap To Sewing Your First Dress In 30 Days
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;color:#444444;line-height:1.55;padding-bottom:18px;">
                The ebook is attached to this email as a PDF. You can also download it instantly using the button below.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:6px 0 22px;">
                <a href="{download_url}" target="_blank" rel="noopener" style="background-color:#FF2D78;color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.06em;padding:14px 28px;border-radius:12px;display:inline-block;font-size:14px;text-transform:uppercase;">
                  Download PDF
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#666666;line-height:1.6;padding-top:8px;border-top:1px solid #f3dbe3;">
                Happy Sewing!<br/>
                <strong style="color:#222;">Nicole</strong>
              </td>
            </tr>
          </table>
          <p style="font-size:11px;color:#aaa;margin-top:14px;">
            You're receiving this because you requested the free sewing roadmap. If this wasn't you, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
    """


def build_admin_email_html(name: str, email: str, phone: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF6F8;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#222;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;padding:30px;">
          <tr><td style="font-size:12px;color:#FF2D78;font-weight:800;letter-spacing:2px;text-transform:uppercase;">New Lead — Sewing Roadmap</td></tr>
          <tr><td style="font-size:20px;font-weight:800;padding:8px 0 16px;">Beginner's Sewing Roadmap</td></tr>
          <tr><td style="font-size:14px;color:#666;padding:4px 0;"><strong style="color:#222;">Name:</strong> {name}</td></tr>
          <tr><td style="font-size:14px;color:#666;padding:4px 0;"><strong style="color:#222;">Email:</strong> {email}</td></tr>
          <tr><td style="font-size:14px;color:#666;padding:4px 0;"><strong style="color:#222;">Phone:</strong> {phone}</td></tr>
        </table>
      </td></tr>
    </table>
    """


# ----- Helpers -----
def _rate_limited(ip: str) -> bool:
    now = time.time()
    bucket = _RATE_BUCKET.setdefault(ip, [])
    # purge old
    cutoff = now - RATE_LIMIT_WINDOW
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    if len(bucket) >= RATE_LIMIT_MAX:
        return True
    bucket.append(now)
    return False


async def _is_duplicate(email: str) -> bool:
    """Return True if a lead with this email was already captured (cooldown 5 min)."""
    if leads_col is None:
        return False
    try:
        doc = await leads_col.find_one({"email": email.lower()})
        if not doc:
            return False
        last_ts = doc.get('last_submitted_at')
        if not last_ts:
            return False
        last_dt = datetime.fromisoformat(last_ts)
        if last_dt.tzinfo is None:
            last_dt = last_dt.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - last_dt).total_seconds()
        return elapsed < 300  # 5 minutes
    except Exception as e:
        logger.warning(f'dedupe check failed: {e}')
        return False


async def _record_submission(email: str):
    if leads_col is None:
        return
    try:
        await leads_col.update_one(
            {"email": email.lower()},
            {"$set": {"last_submitted_at": datetime.now(timezone.utc).isoformat()},
             "$inc": {"submission_count": 1}},
            upsert=True,
        )
    except Exception as e:
        logger.warning(f'failed to record submission: {e}')


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "Sewing Roadmap Lead Capture API"}


@api_router.get("/health")
async def health():
    return {
        "status": "ok",
        "resend_configured": bool(RESEND_API_KEY),
        "ebook_attached": bool(EBOOK_B64),
    }


@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(lead: LeadRequest, request: Request):
    if not RESEND_API_KEY:
        logger.error('Resend not configured; rejecting lead')
        raise HTTPException(status_code=500, detail="Email service not configured")

    # Rate limiting per IP
    client_ip = request.client.host if request.client else 'unknown'
    if _rate_limited(client_ip):
        logger.warning(f'Rate limit hit for {client_ip}')
        raise HTTPException(status_code=429, detail="Too many submissions. Please wait a moment and try again.")

    # Duplicate detection
    if await _is_duplicate(lead.email):
        logger.info(f'Duplicate submission ignored for {lead.email}; redirecting')
        return LeadResponse(status="duplicate", redirect_url=REDIRECT_URL)

    sender = f'{SENDER_NAME} <{SENDER_EMAIL}>'

    # 1) Email to subscriber with PDF attachment
    subscriber_params = {
        "from": sender,
        "to": [lead.email],
        "subject": "Your Free Sewing Roadmap Is Here 🧵",
        "html": build_subscriber_email_html(lead.name, EBOOK_DOWNLOAD_URL),
    }
    if EBOOK_B64:
        subscriber_params["attachments"] = [
            {
                "filename": EBOOK_FILENAME,
                "content": EBOOK_B64,
                "content_type": "application/pdf",
            }
        ]

    # 2) Notification email to admin
    admin_params = {
        "from": sender,
        "to": [LEAD_RECIPIENT_EMAIL],
        "reply_to": lead.email,
        "subject": f"New Sewing Ebook Lead: {lead.name}",
        "html": build_admin_email_html(lead.name, lead.email, lead.phone),
    }

    subscriber_email_id = None
    admin_email_id = None

    try:
        subscriber_resp = await asyncio.to_thread(resend.Emails.send, subscriber_params)
        subscriber_email_id = subscriber_resp.get("id") if isinstance(subscriber_resp, dict) else None
        logger.info(f'Subscriber ebook email sent: id={subscriber_email_id} to={lead.email}')
    except Exception as e:
        logger.error(f'FAILED subscriber email to {lead.email}: {e}', exc_info=True)
        raise HTTPException(status_code=502, detail=f"Failed to deliver ebook email: {str(e)}")

    try:
        admin_resp = await asyncio.to_thread(resend.Emails.send, admin_params)
        admin_email_id = admin_resp.get("id") if isinstance(admin_resp, dict) else None
        logger.info(f'Admin notification sent: id={admin_email_id}')
    except Exception as e:
        # Don't fail the user flow if only the admin notification fails
        logger.error(f'Admin notification failed (non-fatal): {e}', exc_info=True)

    await _record_submission(lead.email)

    return LeadResponse(
        status="success",
        redirect_url=REDIRECT_URL,
        subscriber_email_id=subscriber_email_id,
        admin_email_id=admin_email_id,
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    try:
        mongo_client.close()
    except Exception:
        pass
