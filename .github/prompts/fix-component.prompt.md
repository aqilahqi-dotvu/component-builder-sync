---
agent: dotvu-component-builder
description: Fix runtime, rendering, or consistency issues in a Dot.vu component
---

# Fix Dot.vu Component

Use this prompt when a Dot.vu component is broken, inconsistent, or fails to render.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/prompts/dotvu-api-reference.prompt.md
#file:common.js
#file:editor.js
#file:live.js

## First-pass checks

Look for these common breakages:

- Invented imports from `@ui`, `@utils`, `@hooks`, `@constants`, `@icons`, or `@data`
- `@icons` imported in `live.js`
- Raw `<style>` tags instead of `<ScopedStyle>`
- Missing `useScaler`
- `const { s } = useScaler()` not first inside `Component`
- `s()` used outside `Component`
- px values not wrapped in `s()` in `live.js`
- `Checkbox` using unsupported `description` prop
- `Button` missing required `style` prop
- Duplicate exported functions
- Missing `getInitialState` export in `editor.js` or `live.js`
- `getSizeTypes` and root height mismatch
- `// HEIGHT_PATTERN:` comment mismatch
- Dynamic values or audience data added without explicit request
- Broken state spread order in `getInitialState`
- Table list missing ids, edit drawer, duplicate, delete, or reorder behavior

## Repair approach

1. Fix runtime blockers first.
2. Preserve existing behavior and state names when possible.
3. Remove unsupported imports or replace them with allowed patterns.
4. Replace raw styles with `ScopedStyle`.
5. Fix sizing and scaling without changing the component purpose.
6. Update settings help if the visible behavior changed.

## Final response

Return:

- What was broken
- What was changed
- Files edited
- What to test in Dot.vu
