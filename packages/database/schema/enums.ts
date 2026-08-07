import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["USER", "ADMIN"]);

export const authProviderEnum = pgEnum("auth_provider", [
  "CREDENTIALS",
  "GOOGLE",
  "GITHUB",
]);

export const formStatusEnum = pgEnum("form_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "CLOSED",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "TIME",
  "DATETIME",
  "URL",
  "RADIO",
  "CHECKBOX",
  "DROPDOWN",
  "FILE_UPLOAD",
  "RATING",
  "YES_NO",
  "SIGNATURE",
  "ADDRESS",
  "LINEAR_SCALE",
  "MULTIPLE_CHOICE_GRID",
  "CHECKBOX_GRID",
]);

export const responseStatusEnum = pgEnum("response_status", [
  "STARTED",
  "COMPLETED",
  "ABANDONED",
  "PARTIAL",
]);

export const logicOperatorEnum = pgEnum("logic_operator", [
  "EQUALS",
  "NOT_EQUALS",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "CONTAINS",
  "NOT_CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "IS_EMPTY",
  "IS_NOT_EMPTY",
]);

export const logicActionEnum = pgEnum("logic_action", [
  "SHOW",
  "HIDE",
  "JUMP_TO",
  "REQUIRE",
  "SKIP",
]);

export const analyticsEventEnum = pgEnum("analytics_event", [
  "FORM_VIEW",
  "FORM_START",
  "QUESTION_VIEW",
  "QUESTION_ANSWER",
  "SECTION_CHANGE",
  "FORM_SUBMIT",
  "FORM_ABANDON",
  "FOCUS",
  "BLUR",
]);

export const fileProviderEnum = pgEnum("file_provider", [
  "LOCAL",
  "S3",
  "R2",
  "CLOUDINARY",
  "SUPABASE",
]);

export const themeModeEnum = pgEnum("theme_mode", ["LIGHT", "DARK", "SYSTEM"]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "ACTIVE",
  "DISABLED",
]);

export const targetTypeEnum = pgEnum("target_type", [
  "QUESTION",
  "SECTION",
  "FORM_END",
]);

export const collaboratorRoleEnum = pgEnum("collaborator_role", [
  "EDITOR",
  "VIEWER",
]);

export const authTokenTypeEnum = pgEnum("auth_token_type", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);
