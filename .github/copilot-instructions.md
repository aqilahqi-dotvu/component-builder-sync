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
- `troubleshoot-component` — diagnose errors without applying fixes
- `update-component-info` — update the help article in `getSettings`
- `update-readme` — sync README.md after adding, removing, or renaming a skill, prompt, or instruction

## Skills — use for specific features and patterns

Type `/` in chat or describe what you need and the agent will load the right skill:

| Skill                     | Use when                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `dotvu-api`               | Looking up API signatures, allowed imports, or copying boilerplate skeletons            |
| `add-table-list`          | Adding or refactoring a reorderable editable list (TableContainer + Drawer)             |
| `breakpoint-height`       | Adding BREAKPOINT_AWARE height or converting an existing component to responsive height |
| `width-breakpoint-layout` | Adding layout stacking based on component width without changing height mode            |
| `form-component`          | Building or reviewing a form component (validation, submit, reset, triggers)            |
| `checkbox`                | Adding toggle controls to editor settings                                               |
| `dropdown`                | Adding single-choice select controls to editor settings                                 |
| `section-headings`        | Adding section or sub-section headings to editor tabs                                   |
| `shadow`                  | Adding shadow settings (hasShadow, resolveShadowColor, hover shadow)                    |
| `svgpicker`               | Adding an icon picker with currentColor support and viewBox normalization               |
| `textarea`                | Adding a multi-line text input (native HTML textarea) when TextInput is too narrow      |

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
