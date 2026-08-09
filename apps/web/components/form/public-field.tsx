"use client";

import { useEffect, useRef } from "react";

import type { AtelierQuestion } from "../../lib/form-mapper";
import {
  inputTypeForQuestion,
  needsGridSettings,
} from "../../lib/question-types";
import { cn } from "../../lib/utils";

export type AnswerValue =
  | string
  | string[]
  | Record<string, string | string[]>;

export function PublicField({
  question,
  index,
  value,
  onChange,
  onChoice,
  onToggleCheckbox,
  onGridAnswer,
  onFile,
  large,
  centered,
  showNumber = true,
  compact,
}: {
  question: AtelierQuestion;
  index: number;
  value: AnswerValue | undefined;
  onChange: (v: string) => void;
  onChoice: (v: string) => void;
  onToggleCheckbox?: (v: string) => void;
  onGridAnswer?: (row: string, column: string, multi: boolean) => void;
  onFile?: (file: File) => void;
  large?: boolean;
  centered?: boolean;
  showNumber?: boolean;
  /** Smaller typography for builder side preview */
  compact?: boolean;
}) {
  const inputStyle = {
    background: "var(--form-input-bg)",
    color: "var(--form-text)",
    boxShadow: "inset 0 0 0 1px var(--form-border)",
  };
  const settings = (question.settings ?? {}) as Record<string, unknown>;
  const scaleMin = Number(settings.min ?? 1);
  const scaleMax = Number(settings.max ?? 10);
  const scaleValues = Array.from(
    { length: Math.max(2, Math.min(12, scaleMax - scaleMin + 1)) },
    (_, i) => scaleMin + i,
  );
  const rows = (settings.rows as string[]) ?? ["Row 1", "Row 2"];
  const columns = (settings.columns as string[]) ?? ["Col 1", "Col 2"];
  const gridValue =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, string | string[]>)
      : {};

  return (
    <div className={cn("w-full", centered && "text-center")}>
      {showNumber && (
        <p
          className={cn("text-sm", compact && "text-xs")}
          style={{ color: "var(--form-muted)" }}
        >
          {index + 1}
          {question.required ? " *" : ""}
        </p>
      )}
      {!showNumber && question.required && (
        <p className="text-sm" style={{ color: "var(--form-muted)" }}>
          *
        </p>
      )}
      <h2
        className={cn(
          "mt-2 font-medium",
          compact
            ? "text-xl sm:text-2xl"
            : large
              ? "text-3xl sm:text-4xl"
              : "text-2xl",
        )}
      >
        {question.title}
      </h2>
      {question.description && (
        <p
          className={cn("mt-2", compact && "text-sm")}
          style={{ color: "var(--form-muted)" }}
        >
          {question.description}
        </p>
      )}
      <div
        className={cn(
          compact ? "mt-4" : "mt-6",
          centered && "mx-auto flex w-full max-w-lg flex-col items-center",
        )}
      >
        {question.type === "FILE_UPLOAD" ? (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile?.(file);
            }}
          />
        ) : question.type === "SIGNATURE" ? (
          <SignaturePad
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            compact={compact}
          />
        ) : question.type === "LONG_TEXT" || question.type === "ADDRESS" ? (
          <textarea
            rows={question.type === "ADDRESS" ? 3 : compact ? 3 : 4}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              question.type === "ADDRESS"
                ? "Street, city, postal code…"
                : (question.placeholder ?? undefined)
            }
            className={cn(
              "w-full rounded-[var(--form-radius)] px-4 py-3",
              compact ? "min-h-24" : "min-h-32",
            )}
            style={inputStyle}
          />
        ) : question.type === "RATING" || question.type === "LINEAR_SCALE" ? (
          <div
            className={cn("flex flex-wrap gap-3", centered && "justify-center")}
          >
            {(question.type === "RATING" ? [1, 2, 3, 4, 5] : scaleValues).map(
              (n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChoice(String(n))}
                  className={cn(
                    "flex items-center justify-center rounded-full px-2",
                    compact ? "h-10 min-w-10" : "h-14 min-w-14",
                  )}
                  style={{
                    background:
                      String(value) === String(n)
                        ? "var(--form-primary)"
                        : "transparent",
                    color:
                      String(value) === String(n)
                        ? "var(--form-primary-text)"
                        : undefined,
                    boxShadow:
                      String(value) === String(n)
                        ? undefined
                        : "inset 0 0 0 1px var(--form-border)",
                  }}
                >
                  {n}
                </button>
              ),
            )}
          </div>
        ) : question.type === "YES_NO" ? (
          <div className={cn("flex gap-3", centered && "justify-center")}>
            {["Yes", "No"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onChoice(label)}
                className={cn(
                  "rounded-[var(--form-radius)] px-6",
                  compact ? "min-h-11 min-w-[5.5rem]" : "min-h-14 min-w-[7rem]",
                )}
                style={{
                  background:
                    value === label ? "var(--form-primary)" : "transparent",
                  color:
                    value === label ? "var(--form-primary-text)" : undefined,
                  boxShadow:
                    value === label
                      ? undefined
                      : "inset 0 0 0 1px var(--form-border)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : question.type === "CHECKBOX" ? (
          <div className="space-y-3">
            {(question.options || []).map((opt) => {
              const selected =
                Array.isArray(value) && value.includes(opt.value);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggleCheckbox?.(opt.value)}
                  className={cn(
                    "flex w-full items-center rounded-[var(--form-radius)] px-4 text-left",
                    compact ? "min-h-11" : "min-h-14",
                  )}
                  style={{
                    boxShadow: selected
                      ? "inset 0 0 0 1.5px var(--form-primary)"
                      : "inset 0 0 0 1px var(--form-border)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : question.type === "RADIO" || question.type === "DROPDOWN" ? (
          <div className="space-y-3">
            {(question.options || []).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChoice(opt.value)}
                className={cn(
                  "flex w-full items-center rounded-[var(--form-radius)] px-4 text-left",
                  compact ? "min-h-11" : "min-h-14",
                )}
                style={{
                  boxShadow:
                    value === opt.value
                      ? "inset 0 0 0 1.5px var(--form-primary)"
                      : "inset 0 0 0 1px var(--form-border)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : needsGridSettings(question.type) ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left" />
                  {columns.map((col) => (
                    <th key={col} className="p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <td className="p-2 font-medium">{row}</td>
                    {columns.map((col) => {
                      const cell = gridValue[row];
                      const multi = question.type === "CHECKBOX_GRID";
                      const checked = multi
                        ? Array.isArray(cell) && cell.includes(col)
                        : cell === col;
                      return (
                        <td key={col} className="p-2 text-center">
                          <button
                            type="button"
                            aria-label={`${row} ${col}`}
                            onClick={() => onGridAnswer?.(row, col, multi)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                            style={{
                              background: checked
                                ? "var(--form-primary)"
                                : "transparent",
                              boxShadow: checked
                                ? undefined
                                : "inset 0 0 0 1px var(--form-border)",
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <input
            type={inputTypeForQuestion(question.type)}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder ?? undefined}
            className={cn(
              "w-full rounded-[var(--form-radius)] px-4",
              compact ? "h-11" : "h-14",
            )}
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );
}

function SignaturePad({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = value;
  }, [value]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={640}
        height={200}
        className={cn(
          "w-full touch-none rounded-[var(--form-radius)]",
          compact ? "h-28" : "h-40",
        )}
        style={{
          background: "var(--form-input-bg)",
          boxShadow: "inset 0 0 0 1px var(--form-border)",
        }}
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          ctx.strokeStyle = "#141414";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          const canvas = canvasRef.current;
          if (canvas) onChange(canvas.toDataURL("image/png"));
        }}
      />
      <button
        type="button"
        className="mt-2 text-sm"
        style={{ color: "var(--form-muted)" }}
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onChange("");
          }
        }}
      >
        Clear signature
      </button>
    </div>
  );
}
