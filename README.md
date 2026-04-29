# Dot.vu Component Builder Sync

This repository shares the Copilot instructions, prompts, skills, and templates used to build Dot.vu components. The goal is to streamline our workflow and ensure every component follows the same standards — consistent structure, editor UX, and code patterns — regardless of who builds it.

---

## Getting Started

### Option A — GitHub Desktop (easier)

1. Install [GitHub Desktop](https://desktop.github.com/download/) if you haven't already.
2. Sign in to your GitHub account inside the app.
3. On this repository's page, click the green **`<> Code`** button (top right) and select **Open with GitHub Desktop**.
4. Choose a local path and clone.

### Option B — Command line

```bash
git clone https://github.com/aqilahqi-dotvu/component-builder-sync.git
```

If you want to clone directly into your existing working folder, add `.` at the end:

```bash
git clone https://github.com/aqilahqi-dotvu/component-builder-sync.git .
```

All `.js` files are ignored by this repo, so cloning into your working folder will not affect your existing component work.

Open the cloned folder in VS Code. The `.github/` folder will be picked up automatically by GitHub Copilot.

No agent switching required — the instructions apply to **Ask**, **Edit**, and **Agent** modes automatically.

---

## Folder Structure

### `.github/`

Contains everything that configures Copilot's behaviour in this repo.

#### `.github/instructions/`

Always-on rules loaded automatically when working on component files.

| File                                  | Purpose                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dotvu-component.instructions.md`     | Core coding rules for all component files (`common.js`, `editor.js`, `live.js`). Covers state field conventions, tab/section structure, animation patterns, and what the Dot.vu runtime supports. |
| `component-structure.instructions.md` | Enforces a consistent top-down code structure in component files, especially in `live.js`.                                                                                                        |

#### `.github/prompts/`

Slash commands for the main workflow tasks. Type `/` in Copilot Chat to invoke them.

| Prompt                             | Command                   | Purpose                                                                                                                                                                                     |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-plan.prompt.md`             | `/build-plan`             | **Plan before you build.** The agent asks clarifying questions, produces a written plan covering tabs, state fields, and behaviors, and waits for your approval before any code is written. |
| `new-component.prompt.md`          | `/new-component`          | Scaffold a brand-new component from scratch.                                                                                                                                                |
| `edit-component.prompt.md`         | `/edit-component`         | Modify an existing component safely, preserving existing state and structure.                                                                                                               |
| `review-component.prompt.md`       | `/review-component`       | Audit a component for compliance with team standards.                                                                                                                                       |
| `fix-component.prompt.md`          | `/fix-component`          | Debug and repair a broken component.                                                                                                                                                        |
| `troubleshoot-component.prompt.md` | `/troubleshoot-component` | Diagnose errors without applying fixes. Use when a component throws an error or produces unexpected output.                                                                                 |
| `update-component-info.prompt.md`  | `/update-component-info`  | Update the `getSettings` help article to reflect the current component's tabs and controls.                                                                                                 |
| `update-readme.prompt.md`          | `/update-readme`          | Sync README.md after adding, removing, or renaming a skill, prompt, or instruction file.                                                                                                    |

#### `.github/skills/`

On-demand expertise loaded automatically when relevant, or invoked with `/` in chat. Skills are for specific features and UI patterns — they don't run unless the task calls for them.

| Skill                      | Command                    | Purpose                                                                                                        |
| -------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `dotvu-api/`               | `/dotvu-api`               | API signatures, allowed imports, and boilerplate skeletons for all three height patterns.                      |
| `add-table-list/`          | `/add-table-list`          | Add a reorderable, editable list using TableContainer + Drawer.                                                |
| `breakpoint-height/`       | `/breakpoint-height`       | Implement or convert BREAKPOINT_AWARE height — ResizeObserver, getSizeTypes, `.dot-component` height override. |
| `width-breakpoint-layout/` | `/width-breakpoint-layout` | Add layout stacking based on component width without changing height mode.                                     |
| `form-component/`          | `/form-component`          | Feature checklist for form components — validation, submit, success view, reset, triggers, actions.            |
| `checkbox/`                | `/checkbox`                | Rules for `Checkbox` controls — short labels, no `description` prop, Label with help pattern.                  |
| `dropdown/`                | `/dropdown`                | Rules for `Dropdown` controls — `{ value, text }` shape, `onChange` wiring, Label pairing.                     |
| `section-headings/`        | `/section-headings`        | Rules and CSS for section and sub-section headings in the editor.                                              |
| `shadow/`                  | `/shadow`                  | Shadow settings — `hasShadow` gating, `resolveShadowColor` helper, hover-only shadow.                          |
| `svgpicker/`               | `/svgpicker`               | Normalize SvgPicker icons for `currentColor` support and responsive sizing.                                    |
| `textarea/`                | `/textarea`                | Rules for native HTML `<textarea>` — when to use it over `TextInput`, consistent styling, newline handling.    |

---

### `templates/`

Reference templates and boilerplate used when generating new components.

| File                | Purpose                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `boilerplate.md`    | The standard icon card boilerplate. Contains full patterns for ResizeObserver, animation, shadow controls, drag-to-reorder, and breakpoint handling. |
| `list-component.md` | A boilerplate for list-style components with reorderable items.                                                                                      |

---

## How the Workflow Works

Copilot picks up the instructions and skills automatically — no agent switching needed. Just use the standard Ask, Edit, or Agent modes.

Type `/` in Copilot Chat to see all available prompts and skills.

**Prompts** handle workflow tasks (plan, build, edit, review, fix).
**Skills** handle specific features (lists, shadows, forms, breakpoints, etc.) — they load automatically when the task calls for them, or you can invoke them directly with `/skill-name`.

---

## The `/build-plan` Workflow

Use `/build-plan` when you want to think through a component before committing to code. This is the recommended starting point for any non-trivial component.

### How to invoke it

In Copilot Chat, type:

```
/build-plan I want to create a testimonial card that displays a customer quote, their name, and a profile image. The editor should control the background color, text colors, spacing, and whether to show a star rating.
```

Or describe your idea informally and then say:

> "Let's plan this first."

### The workflow in action

```
User:   /build-plan + description
Agent:  Asks clarifying questions
User:   Replies with details
Agent:  Creates a written plan covering tabs, state fields, and behaviors
User:   Approves or requests changes
Agent:  Hands off to /new-component or builds directly on request
```

This forces a pause before code is written, catches ambiguities early, and ensures you and the agent are aligned on what's being built.

---

## ESLint

This repo includes an ESLint config that checks `common.js`, `editor.js`, and `live.js` for errors and style issues before you publish or hand off a component.

### What it checks

- Standard JavaScript errors (undefined variables, unreachable code, etc.)
- React-specific rules: unused JSX variables, inline styles, and consistent prop ordering
- Security: warns on `no-eval`

### Prerequisites

- **Node.js** v18 or later — [nodejs.org/en/download](https://nodejs.org/en/download)
- **npm** is included with Node.js

Verify your versions:

```bash
node -v
npm -v
```

### Install

Run this once from the root of the repo:

```bash
npm install
```

### Usage

| Command            | What it does                             |
| ------------------ | ---------------------------------------- |
| `npm run lint`     | Report all errors and warnings           |
| `npm run lint-fix` | Auto-fix safe issues and report the rest |

Run lint before handing off any component. The `/troubleshoot-component` prompt runs lint as its first step — paste any terminal errors into chat and it will diagnose and fix them.

---

## Runtime Files

Every component is implemented with exactly three files:

| File        | Purpose                                |
| ----------- | -------------------------------------- |
| `common.js` | Shared state schema and default values |
| `editor.js` | Editor UI — tabs, sections, controls   |
| `live.js`   | The rendered live component            |

Do not add extra files or package dependencies unless the Dot.vu runtime explicitly supports them.
