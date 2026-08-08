import type { RouterInput, RouterOutput } from "@repo/trpc/client";

export type { RouterInput, RouterOutput };

export type FormListItem = RouterOutput["form"]["listForms"][number];
export type FormDetail = RouterOutput["form"]["getFormById"];
export type FormSection = NonNullable<FormDetail["sections"]>[number];
export type FormQuestion = NonNullable<FormSection["questions"]>[number];
export type FormQuestionOption = NonNullable<FormQuestion["options"]>[number];

export type ResponseListItem =
  RouterOutput["response"]["listResponses"][number];
export type ResponseDetail = RouterOutput["response"]["getResponse"];

export type ResolvedShareLink = RouterOutput["shareLink"]["resolveBySlug"];
export type PublishedForm = ResolvedShareLink["form"];
