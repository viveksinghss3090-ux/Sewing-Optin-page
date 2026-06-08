import React, { useState } from "react";
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

const LeadModal = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill in all fields to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/leads`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      const redirect = res?.data?.redirect_url;
      toast.success("You're in! Redirecting to your free course...");
      // Redirect immediately, no thank-you page
      setTimeout(() => {
        window.location.href =
          redirect || "https://www.digistore24.com/redir/561361/kazi200/";
      }, 350);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        "We couldn't send your details. Please try again.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

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
            required
          />

          {error && (
            <div
              data-testid={HOME.formError}
              className="text-[12.5px] text-red-500 -mt-1"
            >
              {error}
            </div>
          )}

          <button
            data-testid={HOME.modalSubmit}
            type="submit"
            disabled={loading}
            className="cta-btn mt-2 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
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
