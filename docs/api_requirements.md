# Architecture & API Requirements

This document outlines the frontend routing structure and the corresponding backend services (tRPC routers) you'll need to build to support the Form Builder platform.

## 1. Frontend Routes (Next.js App Router)

These are the URL paths the user will navigate through in the frontend app.

| Route | Purpose |
| :--- | :--- |
| `/dashboard` | Main dashboard listing all forms and high-level stats. |
| `/forms/create` | Template selection and "Start from Scratch" screen. |
| `/forms/[id]/edit` | The core 3-panel Form Builder (Canvas, Theme Studio, Logic). |
| `/forms/[id]/settings` | Publish settings, access control, form slug configuration. |
| `/forms/[id]/share` | Share links, QR code generation, and embed codes. |
| `/forms/[id]/responses` | Data table showing all submissions for a specific form. |
| `/forms/[id]/analytics` | Charts showing completion rates and drop-off metrics. |
| `/f/[slug]` | **Public Form:** The live form that respondents will actually fill out. |

---

## 2. Backend Services & Functions

To support the frontend, you'll want to group your backend into **3 main services** (or tRPC routers). Here are the functions you'll need for each:

### A. Form Service (`formRouter`)
*Manages the creation, configuration, and structural state of the forms.*

*   `createForm` — Creates a new form (either blank or from a template).
*   `getForms` — Fetches a list of forms for the dashboard (with pagination and search/filters).
*   `getFormById` — Fetches the complete form schema, theme, and logic for the builder.
*   `updateForm` — Saves changes to the form structure, theme, or logic rules.
*   `deleteForm` — Archives or permanently deletes a form.
*   `publishForm` — Updates the visibility status and publish settings (e.g., password protection, expiration date).
*   `getPublicFormBySlug` — Fetches the form data needed for the respondent. *(Note: This endpoint must be public/unauthenticated so anyone can fill out the form).*

### B. Response Service (`responseRouter`)
*Manages the data submitted by respondents.*

*   `submitResponse` — Accepts and validates the respondent's answers, then saves them to the database. *(Public/unauthenticated)*
*   `getResponses` — Fetches tabular response data for the creator (includes filtering, sorting, and pagination).
*   `getResponseById` — Fetches a single, detailed view of one respondent's submission.
*   `exportResponses` — Generates a CSV or JSON payload of all responses for download.

### C. Analytics Service (`analyticsRouter`)
*Tracks respondent behavior and generates performance metrics.*

*   `recordEvent` — Logs an interaction (e.g., "form_viewed", "form_started", "question_answered", "abandoned"). *(Public/unauthenticated)*
*   `getFormMetrics` — Aggregates high-level stats (Total Views, Starts, Submissions, Completion Rate, Average Time).
*   `getQuestionDropoff` — Analyzes which specific questions cause users to abandon the form.

---

### Data Structure Tip
When building your database, keep the **Form Content/Questions** separate from the **Theme** and the **Settings**. 
Saving the entire form structure as a flexible JSON object (JSONB in PostgreSQL) is usually the best approach for a form builder, as the question types and logic rules will change frequently!
