import React, { useState } from "react";
import EbookMockup from "@/components/EbookMockup";
import LeadModal from "@/components/LeadModal";
import { Lock, Scissors, Heart, Ruler } from "lucide-react";
import { HOME } from "@/constants/testIds";

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  return (
    <main className="pink-bg min-h-screen w-full flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 relative">
      {/* Floating decorative icons */}
      <Scissors
        className="float-icon w-10 h-10"
        style={{ top: "10%", left: "8%", animationDelay: "0s" }}
        aria-hidden
      />
      <Heart
        className="float-icon w-8 h-8"
        style={{ top: "18%", right: "10%", animationDelay: "1.2s" }}
        aria-hidden
      />
      <Ruler
        className="float-icon w-10 h-10"
        style={{ bottom: "12%", left: "6%", animationDelay: "2.4s" }}
        aria-hidden
      />
      <Scissors
        className="float-icon w-8 h-8"
        style={{ bottom: "18%", right: "8%", animationDelay: "3.2s" }}
        aria-hidden
      />

      <div className="opt-card w-full max-w-[1120px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16 relative">
        {/* Curved arrow pointing to ebook (desktop only) */}
        <svg
          className="curved-arrow hidden lg:block"
          style={{ top: "28%", left: "48%", width: 150, height: 90 }}
          viewBox="0 0 150 90"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M10 10 C 30 80, 90 80, 135 35"
            fill="none"
            stroke="#FF2D78"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M135 35 L 122 30 M135 35 L 128 48"
            fill="none"
            stroke="#FF2D78"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="0"
            y="6"
            fontFamily="Caveat, cursive"
            fontSize="22"
            fill="#FF2D78"
            fontWeight="600"
          >
            Yours free!
          </text>
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* LEFT: Copy + CTA */}
          <div className="text-center lg:text-left">
            <div className="fade-up delay-1">
              <span className="eyebrow">FREE SEWING EBOOK</span>
            </div>

            <h1
              data-testid={HOME.headline}
              className="h-display fade-up delay-2 mt-5 text-[34px] sm:text-[44px] lg:text-[48px] xl:text-[54px]"
            >
              Beginner&apos;s <span className="accent">Roadmap</span> To Sewing Your First <span className="accent">Dress</span> In 30 Days
            </h1>

            <p className="h-sub fade-up delay-3 mt-5 text-base sm:text-lg max-w-[520px] mx-auto lg:mx-0">
              Your step-by-step guide to start sewing with confidence from home.
            </p>

            {/* Mobile: ebook between subheadline & CTA */}
            <div className="block lg:hidden mt-8 fade-up delay-3">
              <EbookMockup />
            </div>

            <div className="fade-up delay-4 mt-8 max-w-[460px] mx-auto lg:mx-0">
              <button
                data-testid={HOME.ctaButtonHero}
                onClick={openModal}
                className="cta-btn"
                aria-label="Get my free sewing ebook"
              >
                GET MY FREE EBOOK
                <span className="arrow">→</span>
              </button>

              <p
                data-testid={HOME.privacyText}
                className="privacy mt-4 justify-center lg:justify-start"
              >
                <Lock className="w-3.5 h-3.5" /> We respect your privacy.
              </p>
            </div>

            {/* trust badges */}
            <div className="fade-up delay-5 mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[12px] text-[#888]">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#FF2D78]" /> Loved by 12,000+ beginners
              </span>
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#FF2D78]" /> Step-by-step lessons
              </span>
            </div>
          </div>

          {/* RIGHT: Ebook mockup (desktop) */}
          <div className="hidden lg:flex justify-center items-center fade-up delay-4">
            <EbookMockup />
          </div>
        </div>
      </div>

      <LeadModal open={modalOpen} onOpenChange={setModalOpen} />
    </main>
  );
};

export default LandingPage;
