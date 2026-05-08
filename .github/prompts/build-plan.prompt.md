---
mode: agent
description: Plan a Dot.vu component before writing any code
---

# Build Plan

Use this prompt to produce a written component plan before any code is written.

Do not write any code. Do not edit any files. Produce a written plan only and wait for the user to approve it.

Read first:

#file:.github/instructions/dotvu-component.instructions.md

## Step 1 — Ask before planning

Ask these questions unless the user has already answered them:

**Before I plan this, a few quick questions:**

**1. Height behavior**

- A) Content-based — height grows with content. Best for forms, text, cards, quizzes, and surveys.
- B) Fixed/resizable — fills a defined height. Best for maps, galleries, videos, visual panels, and hero sections.
- C) Breakpoint-aware — height is resizable above a width breakpoint and auto-height below it.

**2. Does the editor need a reorderable list of items?**

- A) Yes — use a table with drag-to-reorder and an edit drawer per item.
- B) No.

**3. Does anything animate?**

- A) Yes — include on-load and manual trigger support.
- B) No.

**4. Are Dynamic Values, Action Sets, or Audience Data needed?**

- A) Yes — explain which fields or events need them.
- B) No.

## Step 2 — Produce the plan

Output a structured written plan with the following sections. Do not write code.

### Component overview

One paragraph describing the component's purpose, visible behavior, and editor experience.

### Height pattern

State the pattern (CONTENT_BASED / RESIZABLE / BREAKPOINT_AWARE) and justify the choice.

### State fields (`getInitialState`)

List every state field with its key, default value, and purpose. Group by concern (content, style, animation, breakpoint).

### Editor tabs and sections

List each tab and the sections and controls inside it. Use this structure:

```
Tab: Content
  Section: [heading]
    - [control type]: [field name] — [purpose]
```

### Actions and triggers

List inbound actions (`getActionHandlers`) and outbound triggers (`getTriggers`) if any. If none, state "None."

### Data fields and fonts

List `getDataFields` entries and `getFonts` entries if any. If none, state "None."

### Dynamic lists

If the component has a reorderable list, describe the item shape, the TableContainer columns, and the Drawer fields.

### Animation

If animation is included, list the state fields (`animationType`, `animationRepeat`, `loadingMode`, `hasStartedLoading`, `animationRunId`) and the editor controls.

### Open questions

List any decisions that were not answered in Step 1 and that would affect the implementation. If none, state "None."

---

Wait for the user to approve or revise the plan before any code is written.
