# Implementation Tasks

## Phase 1: Core Design System & Layouts
- [x] Install and configure Tailwind CSS and Framer Motion in `apps/web`
- [x] Establish `globals.css` with light/dark theme CSS variables
- [x] Set up standard UI components (Buttons, Inputs, Selects, Cards)
- [x] Build the main application shell (Sidebar/Navbar for dashboard)

## Phase 2: Dashboard & Create Flow
- [x] Build workspace library with theme covers
- [x] Build `/create` intent gallery

## Phase 3: The Form Builder (Core)
- [x] Implement the `/forms/[id]/edit` route structure
- [x] Notion-like canvas with floating toolbars
- [x] Live preview beside editor
- [x] Drag-and-drop reordering (dnd-kit)
- [x] Option editing + question props
- [x] Local persistence (Zustand)

## Phase 4: Theme Studio & Settings
- [x] Theme Studio with miniature form previews
- [x] Personality Mode
- [x] Presentation / Flow settings (auto-advance)
- [x] Publish + Form Quality Score

## Phase 5: Public Form Experience & Previews
- [x] `/f/[slug]` welcome → form → completion
- [x] Classic / Conversational / Card modes
- [x] Auto-advance + confetti completion
- [x] Submit persists to response store

## Phase 6: Responses, Analytics & Polish
- [x] `/forms/[id]/responses` reading experience
- [x] `/forms/[id]/analytics` Insights
- [x] Workspace duplicate / delete
- [x] Loading / empty states
