---
agent: dotvu-component-builder
description: Diagnose and explain errors in a Dot.vu component. Use when a component throws an error, fails to load, or produces unexpected output.
---

# Troubleshoot Dot.vu Component

Use this prompt to diagnose a broken or misbehaving Dot.vu component.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:common.js
#file:editor.js
#file:live.js

## Step 1 — Run ESLint

Run `npm run lint` and report all errors and warnings.

Fix any auto-fixable issues with `npm run lint-fix`, then re-run `npm run lint` to confirm what remains.

## Step 2 — Check for known breakages

After linting, scan each file for these common issues:

**Imports**
- Invented imports (`@ui`, `@utils`, `@hooks`, `@constants`, `@icons`, `@data`) that aren't in the allowed list
- `@icons` imported in `live.js`

**Styles**
- Raw `<style>` tags — must be `<ScopedStyle>`

**Scaling**
- `useScaler` not imported in `live.js`
- `const { s } = useScaler()` not the first line inside `Component`
- `s()` called outside `Component` (e.g. in helpers or `getActionHandlers`)
- px values not wrapped in `s()` in `live.js`

**UI components**
- `<Checkbox>` using unsupported `description` prop
- `<Button>` missing required `style` prop
- `<Drawer>` content not wrapped in `<DrawerSection>`
- Save/Cancel buttons inside a `<Drawer>`

**State and exports**
- Missing `getInitialState` export in `editor.js` or `live.js`
- Duplicate exported functions
- Broken state spread order in `getInitialState`
- New state defaults added after `...state` instead of before

**Size and height**
- `getSizeTypes` return value mismatches `height: '100%'` usage
- `// HEIGHT_PATTERN:` comment at the top of `live.js` doesn't match actual pattern

**Lists**
- Table list items missing `id`, edit drawer, duplicate, delete, or reorder behavior

## Step 3 — Report findings

Return a structured diagnosis:

- **ESLint errors/warnings** (file, line, rule, message)
- **Structural issues found** (from Step 2)
- **Root cause** of the reported error, if identifiable
- **Recommended fix** for each issue

Do not apply fixes in this prompt. If the user wants fixes applied, follow up with `fix-component.prompt.md`.
