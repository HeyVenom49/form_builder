# Phase 5: Public Form Experience & Previews

The goal of Phase 5 is to build the actual live form interface that respondents will see when they visit `yourapp.com/f/[slug]`. This interface must be blazing fast, accessible, and feel extremely premium, featuring smooth animations using Framer Motion.

## User Review Required

> [!IMPORTANT]
> **Form Viewing Modes:** The user can select how their form is presented. We will implement three distinct layout engines:
> 1.  **Classic Mode:** All questions are rendered in a continuous vertical scroll (like Google Forms).
> 2.  **Conversational Mode:** One question is presented at a time, vertically centered, with smooth `Framer Motion` slide transitions (like Typeform).
> 3.  **Card Mode:** Questions are grouped into focused cards.
> 
> **Data Fetching:** For the public route (`/f/[slug]`), we will use `trpc.form.getPublicFormBySlug` to fetch the form schema and theme without requiring authentication.

## Open Questions

> [!WARNING]
> 1. Do you want the "Conversational Mode" to automatically advance to the next question when a user selects a multiple-choice option, or should they always have to click a "Next" button?
> 2. How should we handle "Thank You / Completion" screens? Should it be a distinct route like `/f/[slug]/thank-you` or just an animated state replacement on the same page?

## Proposed Changes

### Core Rendering Engine
- #### [NEW] `apps/web/app/f/[slug]/page.tsx`
  - The main entry point for public forms. Fetches the form data via tRPC.
  - Applies the custom CSS variables for the theme (Background, Primary Color, Typography).
  - Determines which mode component to render based on the form's settings.

### Shared Form Components
- #### [NEW] `apps/web/components/public-form/field-renderer.tsx`
  - A factory component that takes a `FormField` from the schema and renders the appropriate input (Short Text, Multiple Choice, Rating, etc.).
  - Uses `react-hook-form` and `zod` dynamically for robust validation before submission.

### Viewing Modes
- #### [NEW] `apps/web/components/public-form/modes/classic-mode.tsx`
  - Renders all fields vertically. Focus states will use Framer Motion to subtly highlight the active question.
- #### [NEW] `apps/web/components/public-form/modes/conversational-mode.tsx`
  - The Typeform-like experience. Uses `AnimatePresence` to slide questions in/out. Handles keyboard navigation (Enter to advance).
- #### [NEW] `apps/web/components/public-form/modes/card-mode.tsx`
  - Groups questions in padded, elevated cards.

### Backend Integration
- #### [NEW] `apps/web/components/public-form/form-provider.tsx`
  - Manages the submission state and wires up to `trpc.response.submitResponse`.

## Verification Plan

### Automated Tests
- TypeScript will ensure the `react-hook-form` dynamic values align with the `FormField` types.

### Manual Verification
- We will navigate to a mock `/f/untitled-form` route.
- We will toggle the 3 viewing modes (Classic, Conversational, Card) to ensure Framer Motion animations are perfectly smooth.
- We will submit a form and verify the `submitResponse` mutation fires successfully.
