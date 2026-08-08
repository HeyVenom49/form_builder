"use client";

import { cn } from "../../lib/utils";

type Props = {
  variant: string;
  className?: string;
};

/** Handcrafted SVG scenes — no emoji, no stock icon clusters */
export function IntentIllustration({ variant, className }: Props) {
  const common = cn("h-full w-full", className);

  switch (variant) {
    case "event":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#E8F0EC" />
          <circle cx="118" cy="36" r="18" fill="#1B6B5A" opacity="0.2" />
          <path
            d="M28 86c18-28 36-42 54-42s36 14 54 42"
            stroke="#1B6B5A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="62" y="48" width="36" height="28" rx="6" fill="#1B6B5A" />
          <path d="M70 48v-6a10 10 0 0120 0v6" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case "feedback":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#EEF6FB" />
          <rect x="36" y="34" width="88" height="52" rx="14" fill="#0284C7" opacity="0.15" />
          <path
            d="M52 56h56M52 68h36"
            stroke="#0284C7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="112" cy="78" r="14" fill="#0284C7" />
          <path d="M106 78h12M112 72v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "survey":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#EEF1F6" />
          <rect x="40" y="30" width="80" height="60" rx="8" fill="#1E3A5F" opacity="0.12" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle
                cx="56"
                cy={46 + i * 16}
                r="5"
                stroke="#1E3A5F"
                strokeWidth="2"
              />
              <path
                d={`M68 ${46 + i * 16}h44`}
                stroke="#1E3A5F"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
      );
    case "hiring":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#F7F0E8" />
          <circle cx="80" cy="44" r="16" fill="#B45309" opacity="0.25" />
          <path
            d="M48 90c8-20 20-30 32-30s24 10 32 30"
            fill="#B45309"
            opacity="0.35"
          />
          <rect x="98" y="28" width="28" height="36" rx="4" fill="#B45309" />
          <path d="M104 40h16M104 48h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#E7F3F1" />
          <path
            d="M42 78V42l38-16 38 16v36l-38 16-38-16z"
            fill="#0F766E"
            opacity="0.18"
          />
          <path
            d="M80 28v64M42 42l38 16 38-16"
            stroke="#0F766E"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#EAF3EC" />
          <circle cx="72" cy="56" r="24" stroke="#2F5D3A" strokeWidth="3" />
          <path
            d="M90 74l22 22"
            stroke="#2F5D3A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "blank":
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#F0EFED" />
          <rect
            x="48"
            y="32"
            width="64"
            height="56"
            rx="8"
            stroke="#44403C"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M72 60h16M80 52v16"
            stroke="#44403C"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "empty":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" aria-hidden>
          <rect width="200" height="140" rx="24" fill="#EFEFEA" />
          <path
            d="M40 100c20-36 40-54 60-54s40 18 60 54"
            stroke="#1B6B5A"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle cx="100" cy="58" r="20" fill="#1B6B5A" opacity="0.15" />
        </svg>
      );
    case "success":
      return (
        <svg viewBox="0 0 200 140" className={common} fill="none" aria-hidden>
          <rect width="200" height="140" rx="24" fill="#E8F0EC" />
          <circle cx="100" cy="64" r="28" fill="#1B6B5A" />
          <path
            d="M86 64l10 10 18-20"
            stroke="#fff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 120" className={common} fill="none" aria-hidden>
          <rect width="160" height="120" rx="20" fill="#F0EFED" />
        </svg>
      );
  }
}
