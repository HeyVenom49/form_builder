"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  useCreateShareLink,
  useDeactivateShareLink,
  useDeleteShareLink,
  useListShareLinks,
  useUpdateShareLink,
} from "../../hook/api/share-link";
import {
  useInviteCollaborator,
  useLeaveForm,
  useListCollaborators,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from "../../hook/api/collaborator";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useListWebhooks,
  useRotateWebhookSecret,
  useUpdateWebhook,
  useWebhookDeliveries,
  useRetryWebhookDelivery,
} from "../../hook/api/webhook";
import { useUpdateFormSettings } from "../../hook/api/form";
import {
  useCreateLogicRule,
  useDeleteLogicRule,
} from "../../hook/api/form";
import { useCreateTemplateFromForm } from "../../hook/api/template";
import { useListFilesForForm, useDeleteFile } from "../../hook/api/file";
import type { AtelierFormView } from "../../lib/form-mapper";

export function ConnectPanel({ form }: { form: AtelierFormView }) {
  const [tab, setTab] = useState<
    "share" | "people" | "webhooks" | "settings" | "logic" | "files" | "template"
  >("share");

  return (
    <div className="atelier-scroll h-full overflow-auto p-5">
      <h2 className="font-display text-2xl tracking-tight">Connect</h2>
      <p className="mt-1 text-sm text-[var(--atelier-ink-muted)]">
        Share links, people, webhooks, settings — all live on the API.
      </p>
      <div className="mt-4 flex flex-wrap gap-1">
        {(
          [
            ["share", "Share"],
            ["people", "People"],
            ["webhooks", "Webhooks"],
            ["settings", "Settings"],
            ["logic", "Logic"],
            ["files", "Files"],
            ["template", "Template"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === id
                ? "bg-[var(--atelier-ink)] text-white"
                : "bg-white text-[var(--atelier-ink-soft)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "share" && <ShareTab formId={form.id} />}
        {tab === "people" && <PeopleTab formId={form.id} />}
        {tab === "webhooks" && <WebhooksTab formId={form.id} />}
        {tab === "settings" && <SettingsTab form={form} />}
        {tab === "logic" && <LogicTab form={form} />}
        {tab === "files" && <FilesTab formId={form.id} />}
        {tab === "template" && <TemplateTab formId={form.id} title={form.title} />}
      </div>
    </div>
  );
}

function ShareTab({ formId }: { formId: string }) {
  const { shareLinks } = useListShareLinks({ formId });
  const { createShareLinkAsync, isPending } = useCreateShareLink();
  const { updateShareLinkAsync } = useUpdateShareLink();
  const { deactivateShareLinkAsync } = useDeactivateShareLink();
  const { deleteShareLinkAsync } = useDeleteShareLink();
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-4">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => createShareLinkAsync({ formId, password: password || null })}
      >
        Create share link
      </Button>
      <Input
        placeholder="Optional password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <ul className="space-y-3">
        {(shareLinks ?? []).map((link) => (
          <li
            key={link.id}
            className="rounded-xl bg-white p-3 text-sm shadow-[inset_0_0_0_1px_var(--atelier-line)]"
          >
            <p className="font-medium">/f/{link.slug}</p>
            <p className="text-[var(--atelier-ink-muted)]">
              visits {link.visitCount}
              {link.maxVisits ? ` / ${link.maxVisits}` : ""} ·{" "}
              {link.isActive ? "active" : "off"}
              {link.hasPassword ? " · password" : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="text-xs text-[var(--atelier-accent)]"
                onClick={() =>
                  updateShareLinkAsync({
                    id: link.id,
                    isActive: !link.isActive,
                  })
                }
              >
                Toggle
              </button>
              <button
                type="button"
                className="text-xs"
                onClick={() => deactivateShareLinkAsync({ id: link.id })}
              >
                Deactivate
              </button>
              <button
                type="button"
                className="text-xs text-[var(--atelier-danger)]"
                onClick={() => deleteShareLinkAsync({ id: link.id })}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PeopleTab({ formId }: { formId: string }) {
  const { collaborators } = useListCollaborators({ formId });
  const { inviteCollaboratorAsync, isError, error } = useInviteCollaborator();
  const { updateCollaboratorRoleAsync } = useUpdateCollaboratorRole();
  const { removeCollaboratorAsync } = useRemoveCollaborator();
  const { leaveFormAsync } = useLeaveForm();
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="colleague@studio.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLocalError(null);
          }}
        />
        <Button
          size="sm"
          onClick={async () => {
            const trimmed = email.trim().toLowerCase();
            if (!trimmed || !trimmed.includes("@")) {
              setLocalError("Enter a valid email address.");
              return;
            }
            try {
              await inviteCollaboratorAsync({
                formId,
                email: trimmed,
                role: "EDITOR",
              });
              setEmail("");
              setLocalError(null);
            } catch (e) {
              setLocalError(
                e instanceof Error ? e.message : "Could not send invite",
              );
            }
          }}
        >
          Invite
        </Button>
      </div>
      {(localError || isError) && (
        <p className="text-sm text-[var(--atelier-danger)]">
          {localError || error?.message}
        </p>
      )}
      <ul className="space-y-2">
        {(collaborators ?? []).map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
          >
            <span>
              {c.user?.name ?? c.user?.email ?? c.id}
              <span className="text-[var(--atelier-ink-muted)]"> · {c.role}</span>
              {!c.acceptedAt && (
                <span className="text-[var(--atelier-ink-muted)]"> · pending</span>
              )}
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                className="text-xs"
                onClick={() =>
                  updateCollaboratorRoleAsync({
                    id: c.id,
                    role: c.role === "EDITOR" ? "VIEWER" : "EDITOR",
                  })
                }
              >
                Role
              </button>
              <button
                type="button"
                className="text-xs"
                onClick={() => leaveFormAsync({ id: c.id })}
              >
                Leave
              </button>
              <button
                type="button"
                className="text-xs text-[var(--atelier-danger)]"
                onClick={() => removeCollaboratorAsync({ id: c.id })}
              >
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WebhooksTab({ formId }: { formId: string }) {
  const { webhooks } = useListWebhooks({ formId });
  const { createWebhookAsync } = useCreateWebhook();
  const { updateWebhookAsync } = useUpdateWebhook();
  const { deleteWebhookAsync } = useDeleteWebhook();
  const { rotateSecretAsync } = useRotateWebhookSecret();
  const [url, setUrl] = useState("https://example.com/hooks/atelier");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deliveries } = useWebhookDeliveries(
    { id: selectedId! },
    !!selectedId,
  );
  const { retryDeliveryAsync } = useRetryWebhookDelivery();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button
          size="sm"
          onClick={() =>
            createWebhookAsync({
              formId,
              url,
              events: ["FORM_SUBMIT"],
            })
          }
        >
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {(webhooks ?? []).map((w) => (
          <li key={w.id} className="rounded-xl bg-white p-3 text-sm">
            <button type="button" onClick={() => setSelectedId(w.id)} className="text-left">
              <p className="truncate font-medium">{w.url}</p>
              <p className="text-[var(--atelier-ink-muted)]">{w.status}</p>
            </button>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="text-xs"
                onClick={() =>
                  updateWebhookAsync({
                    id: w.id,
                    status: w.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                  })
                }
              >
                Toggle
              </button>
              <button
                type="button"
                className="text-xs"
                onClick={() => rotateSecretAsync({ id: w.id })}
              >
                Rotate secret
              </button>
              <button
                type="button"
                className="text-xs text-[var(--atelier-danger)]"
                onClick={() => deleteWebhookAsync({ id: w.id })}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedId && (
        <div>
          <p className="text-sm font-medium">Deliveries</p>
          <ul className="mt-2 space-y-1">
            {(deliveries ?? []).map((d) => (
              <li key={d.id} className="flex justify-between text-xs">
                <span>
                  {d.status} · {d.attempts}
                </span>
                <button
                  type="button"
                  onClick={() => retryDeliveryAsync({ id: d.id })}
                >
                  Retry
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ form }: { form: AtelierFormView }) {
  const { updateFormSettingsAsync } = useUpdateFormSettings();
  const s = form.settings;
  if (!s) return <p className="text-sm">No settings yet.</p>;

  return (
    <div className="space-y-3 text-sm">
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
        <label key={key} className="flex items-center justify-between gap-3">
          <span>{label}</span>
          <input
            type="checkbox"
            checked={Boolean(s[key])}
            onChange={(e) =>
              updateFormSettingsAsync({
                formId: form.id,
                [key]: e.target.checked,
              })
            }
          />
        </label>
      ))}
      <label className="block">
        Max responses
        <Input
          type="number"
          className="mt-1"
          defaultValue={s.maxResponses ?? undefined}
          onBlur={(e) =>
            updateFormSettingsAsync({
              formId: form.id,
              maxResponses: e.target.value
                ? Number(e.target.value)
                : null,
            })
          }
        />
      </label>
      <label className="block">
        Redirect URL
        <Input
          className="mt-1"
          defaultValue={s.redirectUrl ?? ""}
          onBlur={(e) =>
            updateFormSettingsAsync({
              formId: form.id,
              redirectUrl: e.target.value || null,
            })
          }
        />
      </label>
    </div>
  );
}

function LogicTab({ form }: { form: AtelierFormView }) {
  const { createLogicRuleAsync } = useCreateLogicRule();
  const { deleteLogicRuleAsync } = useDeleteLogicRule();
  const q0 = form.questions[0];
  const q1 = form.questions[1];

  return (
    <div className="space-y-4 text-sm">
      <p className="text-[var(--atelier-ink-muted)]">
        Jump / show / hide based on answers.
      </p>
      <Button
        size="sm"
        disabled={!q0 || !q1}
        onClick={() =>
          createLogicRuleAsync({
            formId: form.id,
            sourceQuestionId: q0!.id,
            operator: "EQUALS",
            value: "Yes",
            action: "SHOW",
            targetType: "QUESTION",
            targetQuestionId: q1!.id,
            priority: 0,
          })
        }
      >
        Add sample SHOW rule
      </Button>
      <ul className="space-y-2">
        {form.logicRules.map((r) => (
          <li key={r.id} className="flex justify-between rounded-lg bg-white px-3 py-2">
            <span>
              {r.action} · {r.operator}
            </span>
            <button
              type="button"
              className="text-[var(--atelier-danger)]"
              onClick={() => deleteLogicRuleAsync({ ruleId: r.id })}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilesTab({ formId }: { formId: string }) {
  const { files } = useListFilesForForm({ formId });
  const { deleteFileAsync } = useDeleteFile();

  return (
    <ul className="space-y-2 text-sm">
      {(files ?? []).length === 0 && (
        <p className="text-[var(--atelier-ink-muted)]">
          No files registered for this form yet. Uploads appear here via the
          file API.
        </p>
      )}
      {(files ?? []).map((f) => (
        <li key={f.id} className="flex justify-between rounded-lg bg-white px-3 py-2">
          <span className="truncate">{f.originalFileName}</span>
          <button
            type="button"
            className="text-[var(--atelier-danger)]"
            onClick={() => deleteFileAsync({ id: f.id })}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

function TemplateTab({ formId, title }: { formId: string; title: string }) {
  const { createTemplateFromFormAsync, isPending } = useCreateTemplateFromForm();
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-3 text-sm">
      <p className="text-[var(--atelier-ink-muted)]">
        Save this experience as a reusable template.
      </p>
      <Button
        size="sm"
        disabled={isPending}
        onClick={async () => {
          await createTemplateFromFormAsync({
            formId,
            name: title,
            category: "atelier",
            isPublic: false,
          });
          setDone(true);
        }}
      >
        {done ? "Saved as template" : "Create template from form"}
      </Button>
    </div>
  );
}
