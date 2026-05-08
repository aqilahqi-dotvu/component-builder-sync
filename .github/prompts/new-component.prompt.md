---
agent: agent
description: Create a new Dot.vu component from scratch
---

# New Dot.vu Component

Use this prompt when creating a new Dot.vu component.

Read the project instructions first:

#file:.github/instructions/dotvu-component.instructions.md

If template files exist in the repository, read them before writing code. If the user says they have no template yet, create the component from the API reference patterns.

## Step 1 - Ask before writing

Before writing code, ask these questions unless the user already answered them:

**Before I build this, a few quick questions:**

**1. Height behavior**

- A) Content-based - height grows with content. Best for forms, text, cards, quizzes, and surveys.
- B) Fixed/resizable - fills a defined height. Best for maps, galleries, videos, visual panels, and hero sections.
- C) Breakpoint-aware - height is resizable above a width breakpoint and auto-height below it.

**2. Does the editor need a reorderable list of items?**

- A) Yes - use a table with drag-to-reorder and an edit drawer per item.
- B) No.

**3. Does anything animate?**

- A) Yes - include on-load and manual trigger support.
- B) No.

**4. Are Dynamic Values, Action Sets, or Audience Data needed?**

- A) Yes - explain which fields or events need them.
- B) No.

## Step 2 - Map answers to decisions

| Answer | Decision                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q1 A   | CONTENT_BASED. `height: SizeType.CONTENT_BASED`. Root height is `auto`. No Advanced tab.                                                               |
| Q1 B   | RESIZABLE. `height: SizeType.RESIZABLE`. Root height is `100%`. No Advanced tab unless requested.                                                      |
| Q1 C   | BREAKPOINT_AWARE. Use the full five-field state, Advanced tab, ResizeObserver, `getSizeTypes` conditional logic, and `.dot-component` height override. |
| Q2 A   | Use `TableContainer` + drag handle + `OptionsMenuRootButton` + `Drawer` + `DrawerSection`. Include Add, Edit, Duplicate, Delete, and Reorder.          |
| Q2 B   | Do not add list infrastructure.                                                                                                                        |
| Q3 A   | Add `animationType`, `animationRepeat`, `loadingMode`, `hasStartedLoading`, and `animationRunId`. Add Animation tab and `Start Animation` action.      |
| Q3 B   | Do not add animation system.                                                                                                                           |
| Q4 A   | Add only the requested dynamic/audience/action-set functionality.                                                                                      |
| Q4 B   | Do not import `@data`, do not use DynamicValueInput, and do not expose audience data.                                                                  |

## Step 3 - Write in this order

1. `common.js` - `getInitialState` with rich defaults. New fields before `...state`.
2. `editor.js` - Settings component first, then exported functions.
3. `live.js` - `Component` and styles, then action handlers if the repository convention requires that order. Preserve existing project ordering if a template establishes it.

## Step 4 - Required settings structure

Use tabs and sections:

- Content tab for text, images, data, and lists
- Style tab for typography, colors, layout, spacing, radius, and shadow
- Animation tab only when animation is requested
- Advanced tab only for BREAKPOINT_AWARE components

Every settings group needs a concise component-prefixed heading class such as `.faq-settings-section-heading`.

## Step 5 - Pre-submit checklist

Check every relevant item before completing.

### Always

- [ ] Exactly `common.js`, `editor.js`, and `live.js` created or updated?
- [ ] `// HEIGHT_PATTERN:` comment at top of `live.js` matches actual pattern?
- [ ] `live.js` imports `useScaler` from `@hooks`?
- [ ] `const { s } = useScaler()` is the first line inside `Component`?
- [ ] `s()` only appears inside `Component`?
- [ ] Every px value in `live.js` is wrapped in `s()`?
- [ ] Exactly one `<ScopedStyle>` block used for component CSS and no raw `<style>` tags?
- [ ] All class names are component-prefixed instead of generic names like `root` or `card`?
- [ ] `box-sizing: border-box` on root and major containers?
- [ ] Root uses `width: '100%'`?
- [ ] Every label/input pair uses `<SettingItem>`?
- [ ] No invented `@ui` imports?
- [ ] No `description` prop on `<Checkbox>`?
- [ ] No `maxWidth`, `minWidth`, or fixed container widths?
- [ ] Every `<Button>` has `style="primary"` or `style="secondary"`?
- [ ] Help article present in `getSettings`?
- [ ] Each exported function appears exactly once?
- [ ] Settings are grouped into `<Section>` blocks with headings?
- [ ] No Audience Data, `@data`, DynamicValueInput, or ActionSet unless explicitly requested?

### If CONTENT_BASED

- [ ] `height: SizeType.CONTENT_BASED`?
- [ ] Live root has `height: 'auto'`?
- [ ] No Advanced tab?
- [ ] No breakpoint state fields?
- [ ] No measurement overlay?

### If RESIZABLE

- [ ] `height: SizeType.RESIZABLE`?
- [ ] Live root has `height: '100%'`?

### If BREAKPOINT_AWARE

- [ ] All five breakpoint state fields included?
- [ ] `getSizeTypes` uses the conditional `isNarrow` / `needsResizableHeight` logic?
- [ ] ResizeObserver pattern included and not simplified?
- [ ] `.dot-component` height override included?
- [ ] Advanced tab with Responsive Width section included?
- [ ] Measurement overlay gated behind `previewWidthInLiveView`?

### If reorderable list

- [ ] Every item has `getUniqueId()` id?
- [ ] `TableContainer` has drag handle first column?
- [ ] `OptionsMenuRootButton` last column includes Edit, Duplicate, Delete?
- [ ] Edit opens a `Drawer` with `DrawerSection`?
- [ ] No Save or Cancel in drawer?

### If animation

- [ ] Animation state fields included?
- [ ] Animation tab included?
- [ ] `Start Animation` action declared?
- [ ] One-shot animation uses `animationRunId` as part of the animated element key?

## Reference implementation

Use the boilerplate only as a pattern reference:

#file:templates/boilerplate/common/index.js
#file:templates/boilerplate/editor/index.js
#file:templates/boilerplate/live/index.js

Do not copy it directly.

Extract only the patterns needed for this component, such as:

- settings structure
- sizing behavior
- `ScopedStyle`
- `useScaler`
- table + drawer editing
- animation, only if requested
- responsive breakpoint, only if requested
