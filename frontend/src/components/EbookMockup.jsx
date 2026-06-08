import React from "react";
import { HOME } from "@/constants/testIds";

/**
 * Pure CSS/SVG 3D-style ebook mockup with sewing-themed illustrations.
 */
export const EbookMockup = () => {
  return (
    <div className="ebook-stage" data-testid={HOME.ebookMockup}>
      <div className="ebook">
        <div className="ebook-spine" aria-hidden />
        <div className="ebook-pages" aria-hidden />
        <div className="ebook-cover">
          <span className="badge">FREE EBOOK • 30 DAYS</span>

          <div className="ebook-illu">
            <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              {/* Soft circle background */}
              <circle cx="100" cy="92" r="78" fill="rgba(255,255,255,0.14)" />

              {/* Measuring tape (curve) */}
              <path
                d="M20 130 C 60 70, 140 70, 180 130"
                stroke="#fff7d6"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M20 130 C 60 70, 140 70, 180 130"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="2 8"
                strokeLinecap="round"
              />

              {/* Scissors */}
              <g transform="translate(112,40) rotate(28)">
                <circle cx="0" cy="0" r="9" fill="none" stroke="#fff" strokeWidth="3" />
                <circle cx="22" cy="0" r="9" fill="none" stroke="#fff" strokeWidth="3" />
                <path d="M9 0 L 60 -10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M31 0 L 60 -10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy="-10" r="3" fill="#fff" />
              </g>

              {/* Thread spool */}
              <g transform="translate(42,52)">
                <rect x="-16" y="-22" width="32" height="44" rx="4" fill="#fff2a8" />
                <rect x="-22" y="-26" width="44" height="6" rx="2" fill="#ffd86b" />
                <rect x="-22" y="20" width="44" height="6" rx="2" fill="#ffd86b" />
                <path
                  d="M-13 -16 L 13 16 M-13 -6 L 13 6 M-13 4 L 13 -4 M-13 14 L 13 -14"
                  stroke="#fff"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <circle cx="22" cy="-26" r="2.5" fill="#fff" />
                <path
                  d="M22 -26 C 36 -10, 50 4, 64 22"
                  stroke="#fff"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 3"
                />
                <path d="M64 22 L 70 28 L 60 26 Z" fill="#fff" />
              </g>

              {/* Fabric / dress */}
              <g transform="translate(100,138)">
                <path
                  d="M-26 -18 L -10 -28 L 0 -32 L 10 -28 L 26 -18 L 34 18 L -34 18 Z"
                  fill="#ffe6ec"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <path d="M-10 -28 Q 0 -22, 10 -28" fill="none" stroke="#fff" strokeWidth="1.5" />
                <circle cx="-12" cy="-2" r="1.6" fill="#FF2D78" opacity="0.6" />
                <circle cx="6" cy="6" r="1.6" fill="#FF2D78" opacity="0.6" />
                <circle cx="-2" cy="12" r="1.6" fill="#FF2D78" opacity="0.6" />
              </g>

              {/* Sparkle */}
              <g fill="#fff">
                <path d="M30 30 l 1.6 4.4 L 36 36 l -4.4 1.6 L 30 42 l -1.6 -4.4 L 24 36 l 4.4 -1.6 Z" opacity="0.85" />
                <path d="M170 60 l 1.2 3.4 L 174.6 64.6 l -3.4 1.2 L 170 69.2 l -1.2 -3.4 L 165.4 64.6 l 3.4 -1.2 Z" opacity="0.7" />
              </g>
            </svg>
          </div>

          <div>
            <div className="cover-title">
              <span className="thin">Beginner&apos;s</span>
              Sewing Roadmap
            </div>
            <div className="cover-sub">YOUR FIRST DRESS IN 30 DAYS</div>
          </div>
        </div>
      </div>
      <div className="ebook-shadow" aria-hidden />
    </div>
  );
};

export default EbookMockup;
