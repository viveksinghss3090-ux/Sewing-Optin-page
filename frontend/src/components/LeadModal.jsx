import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";
import { HOME } from "@/constants/testIds";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9 ()-]{6,30}$/;

const LeadModal = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fire Meta Pixel ViewContent when modal opens
  useEffect(() => {
    if (open && typeof window !== "undefined" && typeof window.fbq === "function") {
      try {
        window.fbq("track", "ViewContent", {
          content_name: "Beginner's Sewing Roadmap Opt-In",
          content_category: "Lead Magnet",
        });
      } catch (e) {
        // no-op
      }
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || success) return; // prevent duplicate submissions

    setError("");
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email || !phone) {
      setError("Please fill in all fields to continue.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/leads`, { name, email, phone });
      const redirect = res?.data?.redirect_url;

      // Fire Meta Pixel Lead event
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        try {
          window.fbq("track", "Lead", {
            content_name: "Beginner's Sewing Roadmap",
            currency: "USD",
            value: 0,
          });
        } catch (e) {
          // no-op
        }
      }

      setSuccess(true);
      toast.success(
        "Success! Your free ebook is on its way. Redirecting to your bonus course..."
      );
      setTimeout(() => {
        window.location.href =
          redirect ||
          "https://www.your-creatory.com/serger-overlocker-course-and-sewing-lessons/?aff=kazi200";
      }, 900);
    } catch (err) {
      console.error("Lead submit failed", err);
      const msg =
        err?.response?.data?.detail ||
        "We couldn't send your details. Please try again.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={HOME.modal}
        className="sm:max-w-[460px] rounded-3xl border-none p-0 overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(255,45,120,0.35)]"
      >
        <div className="bg-[#FFF6F8] px-7 pt-8 pb-5 text-center border-b border-[#fde0e7]">
          <DialogHeader>
            <div className="text-[11px] tracking-[0.2em] font-extrabold text-[#FF2D78] uppercase mb-2">
              Free 30-Day Course
            </div>
            <DialogTitle className="text-[22px] sm:text-[24px] leading-tight font-extrabold text-[#222]">
              Get Your <span className="text-[#FF2D78]">30 Days Free Course</span>
              <br />
              Now On Your Email
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#666] mt-2">
              Enter your details below and we&apos;ll send the roadmap straight to your inbox.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-3.5" noValidate>
          <input
            data-testid={HOME.modalNameInput}
            className="lead-input"
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            disabled={loading || success}
            required
          />
          <input
            data-testid={HOME.modalEmailInput}
            className="lead-input"
            type="email"
            name="email"
            placeholder="Your Best Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading || success}
            required
          />
          <input
            data-testid={HOME.modalPhoneInput}
            className="lead-input"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            disabled={loading || success}
            required
          />

          {error && (
            <div
              data-testid={HOME.formError}
              className="text-[12.5px] text-red-500 -mt-1"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            data-testid={HOME.modalSubmit}
            type="submit"
            disabled={loading || success}
            className="cta-btn mt-2 flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {loading || success ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {success ? "Redirecting..." : "Sending..."}
              </>
            ) : (
              <>
                SEND ME THE FREE COURSE
                <span className="arrow">→</span>
              </>
            )}
          </button>

          <p className="text-center text-[12px] text-[#888] flex items-center justify-center gap-1.5 pt-1">
            <Lock className="w-3 h-3" /> We respect your privacy. No spam, ever.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
