"use client";

import { Input } from "../ui/input";
import { useUpdateFormSettings } from "../../hook/api/form";
import type { AtelierFormView } from "../../lib/form-mapper";

export function FormSettingsPanel({ form }: { form: AtelierFormView }) {
  const { updateFormSettingsAsync } = useUpdateFormSettings();
  const s = form.settings;

  return (
    <div className="atelier-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10">
      <h2 className="font-display text-2xl tracking-tight">Settings</h2>
      <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
        How this form behaves for respondents.
      </p>
      {!s ? (
        <p className="mt-6 text-sm text-[var(--atelier-ink-muted)]">
          No settings yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3 text-sm">
          {(
            [
              ["showProgressBar", "Show progress"],
              ["showQuestionNumbers", "Question numbers"],
              ["collectEmail", "Collect email"],
              ["requireLogin", "Require login"],
              ["allowMultipleResponses", "Allow multiple"],
              ["acceptResponses", "Accept responses"],
              ["allowEditAfterSubmit", "Edit after submit"],
              ["shuffleQuestions", "Shuffle questions"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_var(--atelier-line)]"
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={Boolean(s[key])}
                onChange={(e) =>
                  void updateFormSettingsAsync({
                    formId: form.id,
                    [key]: e.target.checked,
                  })
                }
              />
            </label>
          ))}
          <label className="block rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
            Max responses
            <Input
              type="number"
              className="mt-2"
              defaultValue={s.maxResponses ?? undefined}
              onBlur={(e) =>
                void updateFormSettingsAsync({
                  formId: form.id,
                  maxResponses: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
          <label className="block rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_var(--atelier-line)]">
            Redirect URL
            <Input
              className="mt-2"
              defaultValue={s.redirectUrl ?? ""}
              onBlur={(e) =>
                void updateFormSettingsAsync({
                  formId: form.id,
                  redirectUrl: e.target.value || null,
                })
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}
