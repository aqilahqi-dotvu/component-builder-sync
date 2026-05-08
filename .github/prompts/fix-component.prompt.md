---
agent: dotvu-component-builder
description: Fix runtime, rendering, or consistency issues in a Dot.vu component
---

# Fix Dot.vu Component

Use this prompt when a Dot.vu component is broken, inconsistent, or fails to render.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:common.js
#file:editor.js
#file:live.js

## Step 1 — Diagnose

Run `npm run lint` and report all errors and warnings. Fix any auto-fixable issues with `npm run lint-fix`, then re-run `npm run lint` to confirm what remains.

Then scan each file for these known breakages:

**Imports**

- Invented imports from `@ui`, `@utils`, `@hooks`, `@constants`, `@icons`, or `@data` that aren't in the allowed list
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

## Step 2 — Repair

1. Fix runtime blockers first.
2. Preserve existing behavior and state names when possible.
3. Remove unsupported imports or replace them with allowed patterns.
4. Replace raw styles with `ScopedStyle`.
5. Fix sizing and scaling without changing the component purpose.
6. Update settings help if the visible behavior changed.

## Step 3 — Final response

Return:

- What was broken
- What was changed
- Files edited
- What to test in Dot.vu
