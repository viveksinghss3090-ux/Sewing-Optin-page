from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
LEAD_RECIPIENT_EMAIL = os.environ.get('LEAD_RECIPIENT_EMAIL', 'kaziubaid05@gmail.com')
REDIRECT_URL = os.environ.get('REDIRECT_URL', 'https://www.digistore24.com/redir/561361/kazi200/')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Create the main app without a prefix
app = FastAPI(title="Sewing Roadmap Lead Capture")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=4, max_length=40)


class LeadResponse(BaseModel):
    status: str
    redirect_url: str
    email_id: str | None = None


def build_lead_email_html(name: str, email: str, phone: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6F8;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#222222;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border-radius:16px;padding:32px;">
            <tr>
              <td style="font-size:12px;color:#FF2D78;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">New Lead - Free Sewing Ebook</td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:bold;color:#222222;padding-top:8px;padding-bottom:16px;">Beginner's Sewing Roadmap</td>
            </tr>
            <tr><td style="font-size:14px;color:#666666;padding-bottom:6px;"><strong style="color:#222222;">Name:</strong> {name}</td></tr>
            <tr><td style="font-size:14px;color:#666666;padding-bottom:6px;"><strong style="color:#222222;">Email:</strong> {email}</td></tr>
            <tr><td style="font-size:14px;color:#666666;padding-bottom:18px;"><strong style="color:#222222;">Phone:</strong> {phone}</td></tr>
            <tr>
              <td style="font-size:12px;color:#999999;border-top:1px solid #f1f1f1;padding-top:12px;">
                This lead was captured from the Beginner's Sewing Roadmap landing page.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    """


@api_router.get("/")
async def root():
    return {"message": "Sewing Roadmap Lead Capture API"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "resend_configured": bool(RESEND_API_KEY)}


@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(lead: LeadRequest):
    if not RESEND_API_KEY:
        raise HTTPException(status_code=500, detail="Email service not configured")

    subject = f"New Sewing Ebook Lead: {lead.name}"
    html_content = build_lead_email_html(lead.name, lead.email, lead.phone)

    params = {
        "from": SENDER_EMAIL,
        "to": [LEAD_RECIPIENT_EMAIL],
        "reply_to": lead.email,
        "subject": subject,
        "html": html_content,
    }

    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        email_id = email.get("id") if isinstance(email, dict) else None
        logger.info(f"Lead email sent: {email_id} for {lead.email}")
        return LeadResponse(status="success", redirect_url=REDIRECT_URL, email_id=email_id)
    except Exception as e:
        logger.error(f"Failed to send lead email: {e}")
        # Still allow redirect so user is not blocked; but report failure
        raise HTTPException(status_code=502, detail=f"Failed to send email: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
