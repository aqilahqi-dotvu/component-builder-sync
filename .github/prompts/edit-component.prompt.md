---
agent: dotvu-component-builder
description: Modify an existing Dot.vu component
---

# Edit Dot.vu Component

Use this prompt when changing an existing Dot.vu component.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/prompts/dotvu-api-reference.prompt.md
#file:common.js
#file:editor.js
#file:live.js

## Step 1 - Inspect before editing

Before writing code, identify:

- Current `// HEIGHT_PATTERN:` in `live.js`
- Existing settings tabs and sections
- Existing state fields in `getInitialState`
- Existing actions and triggers
- Existing data fields and fonts
- Existing dynamic lists and whether they use `TableContainer`
- Existing use of dynamic values, action sets, or audience data

## Step 2 - Make the smallest safe change

- Preserve existing field names unless the user asks to rename them.
- Preserve existing tab names and section structure unless the change requires otherwise.
- Add new state defaults before `...state`.
- Do not refactor unrelated working code.
- Do not change height behavior unless explicitly requested.
- Do not add BREAKPOINT_AWARE infrastructure unless the component is already BREAKPOINT_AWARE or the user asks for it.
- Do not add `@data`, DynamicValueInput, ActionSet, or audience data unless explicitly requested.

## Step 3 - Update all affected files

Even a small UI change may require state, settings, live rendering, data fields, fonts, actions, or triggers to stay in sync. Update all three files when needed.

## Step 4 - Pre-submit checklist

- [ ] All affected files updated?
- [ ] No duplicate exported functions introduced?
- [ ] `// HEIGHT_PATTERN:` still accurate?
- [ ] No new px values in `live.js` missing `s()`?
- [ ] `const { s } = useScaler()` is still the first line inside `Component`?
- [ ] No new invented imports?
- [ ] No raw `<style>` tags?
- [ ] No `maxWidth`, `minWidth`, or fixed container widths?
- [ ] Settings changes use `<Section>`, heading labels, and `<SettingItem>`?
- [ ] New list items use `getUniqueId()`?
- [ ] Table lists include Add, Edit, Duplicate, Delete, and Reorder when appropriate?
- [ ] Help article still matches the component?
- [ ] Data fields, actions, triggers, fonts, and live state still reflect the component?

## Step 5 - Final response

Summarize:

- Files changed
- Behavior changed
- Any assumptions or things to test in Dot.vu
