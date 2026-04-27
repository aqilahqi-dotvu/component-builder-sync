# Dot.vu Component Repository Instructions

This repository contains Dot.vu platform AI Components. When helping in this repository, optimize for small, safe edits that keep generated components consistent across the team.

## Component file model

Dot.vu components are implemented with exactly these three runtime files in the component root:

- `common.js`
- `editor.js`
- `live.js`

Do not create additional runtime files or add package dependencies unless the user explicitly asks and confirms that the Dot.vu runtime supports them.

## Use the focused instructions

When working on component files, follow `.github/instructions/dotvu-component.instructions.md`.

When a task is repeatable, prefer the matching prompt file in `.github/prompts`:

- `new-component.prompt.md` for creating a new component
- `edit-component.prompt.md` for modifying an existing component
- `review-component.prompt.md` for checking compliance
- `add-table-list.prompt.md` for dynamic reorderable lists
- `convert-to-breakpoint-aware.prompt.md` for responsive height behavior
- `fix-component.prompt.md` for debugging or repairing a broken component
- `dotvu-api-reference.prompt.md` as the API and pattern reference

## General behavior

- Read existing files before editing them.
- Preserve existing state field names, tabs, sections, triggers, actions, and behavior unless the user asks to change them.
- Prefer editing files in place over returning long code blocks.
- Keep explanations short and mention exactly which files changed.
- Do not invent Dot.vu imports or UI components.
- Do not use dynamic values, action sets, or audience data unless the user explicitly requests them.
- Treat editor UX as part of the product: settings should be clear, grouped, and easy to use.
