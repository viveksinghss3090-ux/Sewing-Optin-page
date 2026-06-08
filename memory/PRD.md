# Sewing Roadmap Landing Page — PRD

## Problem Statement
Build a pixel-perfect responsive landing page that visually mirrors a feminine sewing ebook opt-in (Beginner's Roadmap To Sewing Your First Dress In 30 Days). White card on light pink background (#FFF6F8), Montserrat ExtraBold headline with "Roadmap" and "Dress" highlighted in #FF2D78, 3D ebook mockup on the right (CSS/SVG), subheadline, single CTA "GET MY FREE EBOOK" that opens a centered modal popup. Modal collects Name, Email, Phone. On submit: email lead to kaziubaid05@gmail.com via Resend, then redirect to https://www.digistore24.com/redir/561361/kazi200/ (no thank-you page).

## Architecture / Tasks Done (Dec 2025)
- Backend (FastAPI):
  - POST /api/leads → validates input, sends lead notification email via Resend (async via asyncio.to_thread), returns redirect URL + email_id
  - GET /api/health → reports resend_configured flag
- Frontend (React + Tailwind + shadcn/ui):
  - /app/frontend/src/pages/LandingPage.jsx — main landing
  - /app/frontend/src/components/EbookMockup.jsx — CSS/SVG 3D ebook
  - /app/frontend/src/components/LeadModal.jsx — shadcn Dialog form
  - Responsive: two-column desktop, stacked mobile
- Email integration: Resend (key in /app/backend/.env), sender onboarding@resend.dev
- No DB storage per user choice

## User Persona
- Beginner home sewers (mostly women) wanting structured, friendly guidance.

## Core Requirements (Static)
- Visual match to provided reference
- Single CTA → modal opt-in (no inline form)
- Resend email to kaziubaid05@gmail.com on every lead
- Immediate redirect to digistore24 affiliate link
- Mobile responsive, fast loading, SEO friendly

## Implemented (Dec 2025)
- [x] FastAPI /api/leads endpoint with Resend integration
- [x] Landing page with eyebrow, headline (Roadmap/Dress highlighted), subheadline, CTA, privacy text
- [x] CSS/SVG 3D ebook mockup with sewing-themed illustrations (scissors, tape, spool, fabric)
- [x] Curved "Yours free!" arrow pointing to ebook (desktop)
- [x] Modal opt-in form (Name, Email, Phone) → POST /api/leads → redirect
- [x] Sonner toasts for success/error
- [x] Mobile responsive stacked layout
- [x] Tested end-to-end (testing_agent_v3 iteration_1: 100% backend, 100% frontend)

## Backlog (P1/P2)
- P1: Rate limiting on /api/leads to prevent abuse of the public email endpoint
- P2: A/B test headline variants
- P2: Add analytics (GA4/Meta pixel) for conversion tracking
- P2: Verify custom Resend domain for better deliverability
- P2: Add testimonials and FAQ section below the fold
- P2: Add open-graph image for social sharing

## Next Tasks
- Hand off to user for review; gather any visual tweak requests.
