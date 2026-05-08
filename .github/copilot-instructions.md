# Dot.vu Component Repository Instructions

This repository contains Dot.vu platform AI Components. When helping in this repository, optimize for small, safe edits that keep generated components consistent across the team.

## Component file model

Dot.vu components are implemented with exactly these three runtime files in the component root:

- `common.js`
- `editor.js`
- `live.js`

Do not create additional runtime files or add package dependencies unless the user explicitly asks and confirms that the Dot.vu runtime supports them.

## Core instructions

When working on component files, follow `.github/instructions/dotvu-component.instructions.md`.
When creating or updating component files, also follow `.github/instructions/component-structure.instructions.md`.

## Prompts — use for repeatable tasks

Type `/` in chat to invoke the matching prompt:

- `new-component` — create a new component from scratch
- `edit-component` — modify an existing component safely
- `review-component` — audit a component against team standards
- `build-plan` — plan a component before coding
- `fix-component` — repair a broken component
- `update-component-info` — update the help article in `getSettings`
- `update-readme` — sync README.md after adding, removing, or renaming a skill, prompt, or instruction
- `pre-submit-scan` — scan any component for lint errors, repeated code, incomplete skill patterns, and settings UI gaps before submitting work

## Skills — use for specific features and patterns

Type `/` in chat or describe what you need and the agent will load the right skill:

| Skill                       | Use when                                                                                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dotvu-api`                 | Looking up API signatures, allowed imports, or copying boilerplate skeletons                                                                                                                                    |
| `settings-table`            | Adding or refactoring a reorderable editable settings table (TableContainer + Drawer)                                                                                                                           |
| `breakpoint-height`         | Adding BREAKPOINT_AWARE height or converting an existing component to responsive height                                                                                                                         |
| `width-breakpoint-layout`   | Adding layout stacking based on component width without changing height mode                                                                                                                                    |
| `form-component`            | Building or reviewing a form component (validation, submit, reset, triggers)                                                                                                                                    |
| `settings-checkbox`         | Adding toggle controls to editor settings                                                                                                                                                                       |
| `settings-dropdown`         | Adding single-choice select controls to editor settings                                                                                                                                                         |
| `settings-section-headings` | Adding section or sub-section headings to editor tabs                                                                                                                                                           |
| `settings-shadow`           | Adding shadow settings (hasShadow, resolveShadowColor, hover shadow)                                                                                                                                            |
| `settings-svgpicker`        | Adding an icon picker with currentColor support and viewBox normalization                                                                                                                                       |
| `settings-actionset`        | Adding an ActionSet UI and runtime execution for URL vs Trigger actions; when a trigger action path is being added or edited, first ask whether it should run an ActionSet directly or stay an outbound trigger |
| `settings-textarea`         | Adding a multi-line text input (native HTML textarea) when TextInput is too narrow                                                                                                                              |
| `resizable-both`            | Making a component resizable in all directions (width, height, and diagonally)                                                                                                                                  |
| `settings-font`             | Adding the standard Typography settings block (Font Family, Weight, Size, Line Height, Alignment, Color) in a 2×2 grid whenever a component has a TextInput or textarea                                         |
| `settings-animation`        | Adding animation controls (Type, Duration, Start Animation), Triggers (Animation Starts, Animation Ends), and the Start Animation action — or a Preview Animation button for ambient/scroll-driven animations   |
| `scroll-runtime`            | Making scroll-reliant components work in both the AI builder and Preview Mode by resolving the active scroll container and computing progress against that viewport                                             |
| `dynamic-text`              | Making a component's text field updatable at runtime via an Update Text inbound action, getDataFields exposure, and getActionHandlers in live.js                                                                |
| `rich-textarea`             | Adding a rich text editor field to editor.js with bold, URL links, Dot.vu action links (wand icon), remove-bold/remove-link toolbar, Markdown source toggle, dismissible hint banner, and inline ActionSet list |
| `card-component`            | Building or editing a component with card-based UI — card structure, single vs multiple cards, content fields, settings sections, design consistency, and scaling rules                                         |

## Skill creation

Before creating any new skill, run the following checks in order. Do not create any file or folder until the checks pass and the user confirms.

### Step 1 — Exact name check

List all folder names under `.github/skills/`. If a folder with the proposed skill name already exists:

1. Read its `SKILL.md` and show the user its `name` and `description` from the frontmatter.
2. State clearly: **"A skill with this name already exists."**
3. Stop. Do not create any files.

### Step 2 — Topic overlap check

Cross-reference the proposed skill's purpose against every entry in the **Skills** table above. If one or more existing skills cover the same feature or overlapping use-cases:

1. List each overlapping skill by name.
2. For each, quote the relevant "Use when" description from the table.
3. Summarize what would be different or additional in the proposed skill versus the existing one(s).
4. Ask the user to choose one of:
   - **Create anyway** — proceed with a distinct name and a description that clearly differentiates it.
   - **Merge** — add the new content to the existing skill's `SKILL.md` instead of creating a new folder.
   - **Rename** — pick a new name that avoids the ambiguity, then re-run the name check.

### Step 3 — Orphan stub check

If a folder under `.github/skills/` matches the proposed name but contains no `SKILL.md`, flag it as an orphan stub:

- State: **"A folder named `<name>/` exists but has no SKILL.md. It may be an unfinished stub."**
- Ask whether to populate it or delete it before proceeding.

### Step 4 — Create and register

Only after the checks above are clear and the user confirms:

1. Create `.github/skills/<name>/SKILL.md` with the correct YAML frontmatter (`name`, `description`) and body content.
2. Remind the user to run `/update-readme` to add the new skill to the Skills table in `copilot-instructions.md` and to `README.md`.
3. If content was merged into an existing skill instead, no new folder is needed — only edit the existing `SKILL.md`.

## General behavior

- Always read `common.js`, `editor.js`, and `live.js` before editing an existing component.
- Do not generate from scratch if existing component files are present.
- Preserve working code and existing saved-state compatibility.
- Do not return partial file sets when asked for a complete component.
- Prefer editing files in place over returning long code blocks.
- Keep explanations short and mention exactly which files changed.
- Do not invent Dot.vu imports or UI components.
- Do not use dynamic values, action sets, or audience data unless the user explicitly requests them.
- Treat editor UX as part of the product: settings should be clear, grouped, and easy to use.
- When a component has an action type with a `trigger` option, ask whether that trigger path should use an inline `ActionSet` or remain an outbound trigger in `getTriggers`.
- Ask only for missing product decisions that materially affect implementation.
- If a component is broken, fix runtime blockers before refactoring style or UX.

## Product priorities

1. Runtime stability in Dot.vu
2. Correct sizing and scaling behavior
3. Clear editor UX
4. Consistent team patterns
5. Minimal unnecessary complexity

## Default decisions

- Default height behavior is `CONTENT_BASED` unless the user asks otherwise.
- Use `RESIZABLE` for fixed-height visual components.
- Use `BREAKPOINT_AWARE` only when the user asks for responsive height behavior.
- Use `TableContainer` plus `Drawer` for editable lists.
- Do not use Dynamic Values, Action Sets, or Audience Data unless explicitly requested.

## Known behaviors

- The `width` field inside `getSettings` controls the pixel width of the Settings Panel in the Dot.vu editor. If a user reports the settings panel is too narrow, controls are cramped, or the help icon is not visible, increase this value.
