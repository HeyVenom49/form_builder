"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { themes } from "../../lib/design-tokens";
import { PLAIN_FIELDS } from "./demo-data";
import { LandingHeader, LandingSection } from "./section";

export function VisualTransform() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      setProgress(1);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.28;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  const plain = themes.corporate;
  const rich = themes.warm;
  const t = progress;

  const bg = lerpColor(plain.background, rich.background, t);
  const surface = lerpColor(plain.surface, rich.surface, t);
  const text = lerpColor(plain.text, rich.text, t);
  const muted = lerpColor(plain.textMuted, rich.textMuted, t);
  const primary = lerpColor(plain.primary, rich.primary, t);
  const border = lerpColor("#e2e8f0", "rgba(180,83,9,0.14)", t);
  const radius = `${8 + t * 4}px`;
  const gap = 12 + t * 10;
  const titleSize = 1.05 + t * 0.35;

  return (
    <LandingSection tone="default">
      <LandingHeader
        title="Make every question feel like part of your brand."
        description="Watch a plain questionnaire become an experience."
      />

      <div ref={ref} className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <p className="max-w-sm text-[15px] leading-relaxed text-[var(--atelier-ink-soft)]">
          Typography, spacing, color, inputs, and motion shift together — so the
          form stops feeling generic and starts feeling like you.
        </p>
        <div className="w-full max-w-lg justify-self-start lg:justify-self-end">
          <div
            className="overflow-hidden p-7 sm:p-10"
            style={{
              background: bg,
              borderRadius: `${12 + t * 8}px`,
              boxShadow:
                t > 0.4
                  ? `0 ${12 + t * 20}px ${32 + t * 32}px rgba(180,83,9,${0.04 + t * 0.06})`
                  : "inset 0 0 0 1px rgba(15,23,42,0.08)",
            }}
          >
            <p
              className="font-medium tracking-tight"
              style={{
                color: text,
                fontSize: `${titleSize}rem`,
                fontFamily: t > 0.45 ? "var(--font-display)" : "var(--font-sans)",
                letterSpacing: t > 0.45 ? "-0.02em" : "0",
                marginBottom: gap,
              }}
            >
              Contact us
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap }}>
              {PLAIN_FIELDS.map((field) => (
                <label key={field.label} className="block">
                  <span
                    className="mb-2 block text-sm"
                    style={{
                      color: muted,
                      fontWeight: t > 0.5 ? 500 : 400,
                    }}
                  >
                    {field.label}
                  </span>
                  {"multiline" in field && field.multiline ? (
                    <div
                      className="min-h-[5rem] px-3 py-2.5 text-sm"
                      style={{
                        background: surface,
                        color: muted,
                        borderRadius: radius,
                        boxShadow: `inset 0 0 0 1px ${border}`,
                      }}
                    >
                      {field.placeholder}
                    </div>
                  ) : (
                    <div
                      className="px-3 py-2.5 text-sm"
                      style={{
                        background: surface,
                        color: muted,
                        borderRadius: radius,
                        boxShadow: `inset 0 0 0 1px ${border}`,
                      }}
                    >
                      {field.placeholder}
                    </div>
                  )}
                </label>
              ))}

              <button
                type="button"
                tabIndex={-1}
                className="mt-1 self-start px-5 py-2.5 text-sm font-medium"
                style={{
                  background: primary,
                  color: t > 0.5 ? rich.primaryText : plain.primaryText,
                  borderRadius: radius,
                }}
              >
                {t > 0.65 ? "Send message →" : "Submit"}
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--atelier-ink-muted)]">
            Typography · Spacing · Color · Inputs · Motion
          </p>
        </div>
      </div>
    </LandingSection>
  );
}

function lerpColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  const alpha = ca.a + (cb.a - ca.a) * t;
  if (alpha < 1) return `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
  return `rgb(${r},${g},${bl})`;
}

function parseColor(
  input: string,
): { r: number; g: number; b: number; a: number } | null {
  const hex = input.trim();
  if (hex.startsWith("#")) {
    const h = hex.slice(1);
    if (h.length === 3) {
      return {
        r: parseInt(h[0]! + h[0]!, 16),
        g: parseInt(h[1]! + h[1]!, 16),
        b: parseInt(h[2]! + h[2]!, 16),
        a: 1,
      };
    }
    if (h.length === 6) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: 1,
      };
    }
  }
  const m = hex.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] != null ? Number(m[4]) : 1,
    };
  }
  return null;
}
