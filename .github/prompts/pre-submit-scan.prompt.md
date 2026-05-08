---
mode: ask
description: Scan any Dot.vu component for lint errors, repeated code, incomplete skill patterns, and settings UI gaps before submitting work
---

# Pre-Submit Component Scan

> **Save your project in Dot.vu before running this scan.** Unsaved changes in the studio will not reflect recent code edits.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:common.js
#file:editor.js
#file:live.js

---

## What this scan does

Run every check below in order. For each failure, note the file, the line range or function name, and the specific problem. Collect **all** findings before producing output — do not stop at the first failure.

---

## 1. Lint — mechanical correctness

Run `get_errors` on `common.js`, `editor.js`, and `live.js` and report any compiler or lint errors.

Then verify manually:

- No `s()` calls outside `Component` in `live.js`
- No raw `<style>` tags — only `<ScopedStyle>`
- No duplicate exported function names in any file
- `getInitialState` is exported from both `editor.js` and `live.js`
- `const { s } = useScaler()` is the first line inside `Component`
- Every pixel value in `live.js` is wrapped in `s()` — font sizes, padding, margin, gap, border widths, border-radius, positions, shadows, media queries, and dimensions
- `// HEIGHT_PATTERN:` comment at the top of `live.js` matches the actual height implementation
- All imports come from the allowed list: `react`, `@ui`, `@utils`, `@hooks`, `@constants`, `@icons`, `@common/index`, `@data` — no invented packages
- `@icons` not imported in `live.js`
- No `Checkbox` with a `description` prop
- Every `<Button>` has `style="primary"` or `style="secondary"`
- No `maxWidth`, `minWidth`, or fixed container width values

---

## 2. Structural duplication — repeated code that should be extracted

Scan all three files for blocks that appear 2+ times and would be clearer as a named helper or component.

Look for:

- JSX blocks that repeat with only a field name prefix changed (e.g. `itemFont` / `headingFont` / `bodyFont` with identical structure)
- Normalization triples in `common.js` — the same combination of calls repeated per entity
- Event handlers or async click handlers with identical shape and only variable names changed
- Derived variable chains (e.g. shape → borderRadius → paddingY → paddingX → border → bgColor) computed identically per element
- Style objects defined inline more than once with the same values
- Components or functions defined more than once in the same file

For each: describe the pattern, list line ranges for every occurrence, and recommend whether a helper function or reusable React component is the right fix.

---

## 3. Incomplete skill patterns

Scan for partial implementations of any skill group below. A partial implementation means some fields from a group exist but required companions are missing. Only flag real gaps — do not flag intentionally minimal components.

### Typography
If **any** of `font`, `fontSize`, `fontWeight`, `lineHeight`, `textAlign`, or `color` appears in state, editor, or live CSS:

Verify the full group is consistent across all three files:
- `font` → `FontSelector` in editor → `font-family` in live CSS
- `fontWeight` → `Dropdown` with a `fontWeightOptions` array in editor → applied in live
- `fontSize` → `NumberInput` (min 8, reasonable max) in editor → applied via `s()` in live
- `lineHeight` → `NumberInput` (min 0.5, max 3, step 0.05) in editor → applied as unitless in live
- `color` → `ColorPicker` in editor → applied in live CSS
- `textAlign` → `Dropdown` (left / center / right) in editor → applied in live

Reference: #file:.github/skills/settings-font/SKILL.md

### Shadow
If `hasShadow` exists in state:

- `shadowColor` uses `rgba(...)` not hex in `common.js`
- `shadowOffsetX`, `shadowOffsetY`, `shadowBlur`, `shadowSpread` all present
- All shadow detail controls are gated behind the `hasShadow` toggle in editor
- Live CSS uses a `resolveShadowColor` helper — shadow color is never interpolated as raw hex
- Numeric inputs have safe bounds (offset ±100, blur 0–120, spread ±50)

Reference: #file:.github/skills/settings-shadow/SKILL.md

### SVG icon
If `SvgPicker` or an SVG markup state field exists:

- SVG saved through `normalizeSvgMarkup` (fills/strokes → `currentColor`, fixed width/height stripped, viewBox preserved)
- Icon rendered inside a sized wrapper, not bare `dangerouslySetInnerHTML`
- Color applied via CSS `color` on the wrapper
- If a color picker accompanies the icon picker, they appear together in the editor

Reference: #file:.github/skills/settings-svgpicker/SKILL.md

### CTA / action button
If a button or link has an `actionType` setting (`url` vs `trigger`):

- `actionType`, `url`, and `actionSet` all present in state and editor
- `ActionSet` component shown in editor when `actionType === 'trigger'`
- `runActionSet` called in the live click handler when `actionType === 'trigger'`
- URL opens in a new tab with `noopener,noreferrer`
- Button label is editable in editor

Reference: #file:.github/skills/settings-actionset/SKILL.md

### Checkbox toggle + conditional block
If a `Checkbox` controls visibility or activation of other settings:

- Controlled settings inside `{condition ? (...) : null}` — not always rendered
- `Checkbox` uses `value` prop (not `checked`)
- `onChange` receives a boolean directly (not an event)
- No `description` prop on `Checkbox` — context uses a nearby `<Label help="..." />`

Reference: #file:.github/skills/settings-checkbox/SKILL.md

### Dropdown
If a `Dropdown` is used:

- Options use `{ value, text }` shape (not `{ label }` or other)
- `onChange` receives the value directly (not an event object)
- Always paired with a `<Label>` inside `<SettingItem>`
- Reused option arrays are extracted as named consts above the component

Reference: #file:.github/skills/settings-dropdown/SKILL.md

### Textarea
If a `<textarea>` is used in editor:

- `onChange` reads `e.currentTarget.value`
- A consistent `style` object is applied
- `rows` prop is set

Reference: #file:.github/skills/settings-textarea/SKILL.md

### Editable list / table
If `TableContainer` exists:

- Each item has a stable `id` from `getUniqueId()` — never array index
- Drag-and-drop reorder handle is the first column
- `OptionsMenuRootButton` with Edit, Duplicate, Delete is the last column
- Edit opens a `<Drawer>` with `<DrawerSection>` — no Save or Cancel buttons inside
- Duplicate assigns a new `getUniqueId()` id
- `addButtonText` prop is set on `TableContainer`

Reference: #file:.github/skills/settings-table/SKILL.md

### Animation
If animation state fields exist (`animationType`, `animationDuration`, `startAnimation`, etc.):

- Type and Duration are editable in editor
- Start Animation toggle (On Load / Manually) present unless animation is ambient or scroll-driven
- `Animation Starts` and `Animation Ends` triggers declared in `getTriggers` when applicable
- `Start Animation` inbound action declared in `getActions` when applicable

Reference: #file:.github/skills/settings-animation/SKILL.md

### Section and drawer headings
If settings sections or drawers exist:

- Section headings use `.{prefix}-settings-section-heading` — uppercase, letter-spacing, one per `Section` maximum
- Sub-section headings use `.{prefix}-settings-subsection-heading` — capitalize, no letter-spacing, only when a section has two or more distinct groups
- Both classes defined in the scoped CSS in `editor.js`
- Drawer sections use inline style helpers (`drawerSectionHeadingStyle`, `drawerSubsectionHeadingStyle`) since drawer content may be portaled outside `ScopedStyle`
- Every `DrawerSection` has a `DrawerSectionHeading`
- Logical sub-groups inside a drawer section (e.g. appearance, label, icon, action, typography, colors) each have a `DrawerSubsectionHeading`

Reference: #file:.github/skills/settings-section-headings/SKILL.md

### Form
If the component has a submit button or sends data:

- All fields validated before submit
- `formError` shown above the submit button (not via alert or console)
- Submit, loading, and success states are distinct
- `resetForm` action resets fields to defaults
- `onSubmit`, `onError`, `onSuccess` triggers declared
- `getDataFields` exposes field values

Reference: #file:.github/skills/form-component/SKILL.md

### Scroll-driven behavior
If the component reacts to scroll position:

- Scroll container resolved dynamically — not hardcoded to `window`
- Progress computed relative to the resolved viewport
- Editor preview behavior is isolated from live scroll behavior

Reference: #file:.github/skills/scroll-runtime/SKILL.md

### Responsive width
If `hasWidthBreakpoint` or a `ResizeObserver` exists:

- `currentComponentWidth` stored in state and synced via `ResizeObserver`
- `widthBreakpoint` is user-configurable
- `isCompactLayout` derived from `hasWidthBreakpoint && resolvedWidth <= breakpointWidth`
- Advanced tab with breakpoint controls present
- `getSizeTypes` switches between `RESIZABLE` and `CONTENT_BASED` based on layout

Reference: #file:.github/skills/width-breakpoint-layout/SKILL.md

### Dynamic text
If a text field should be updatable by an external action:

- `getDataFields` exposes the text field
- An `Update Text` inbound action declared in `getActions`
- `getActionHandlers` handles the update
- Live component reacts to the updated state value

Reference: #file:.github/skills/dynamic-text/SKILL.md

### Rich text
If a rich text editor is used in editor:

- Bold, URL link, and Dot.vu action link toolbar present
- Remove-bold and remove-link buttons present
- Markdown source toggle present
- Dismissible hint banner present
- Inline ActionSet list present when action links are used

Reference: #file:.github/skills/rich-textarea/SKILL.md

---

## 4. Settings UI completeness

For every tab and drawer in `editor.js`:

- Every input is wrapped in `<SettingItem>`
- Every `<SettingItem>` has a `<Label>` with a `content` prop
- Non-obvious controls have a `help` prop on the `<Label>`
- Controls are grouped into `<Section>` blocks — no flat ungrouped lists of inputs
- Conditional controls are hidden when their parent toggle is off
- No Save or Cancel buttons inside `<Drawer>`
- Every `<DrawerSection>` has a `<DrawerSectionHeading>`
- Multi-group drawer sections use `<DrawerSubsectionHeading>` per logical group

---

## 5. State completeness

In `common.js > getInitialState`:

- Every state field used in `editor.js` or `live.js` has a default before `...state`
- New defaults are before `...state` so saved state wins
- Dynamic list items include `id: getUniqueId()`
- No state field is read in `live.js` without a default in `common.js`

---

## Output format

### Summary

3–5 sentences covering:
- Overall health (clean / minor issues / needs attention before submitting)
- The single most important problem found, if any
- Whether this component is ready to submit or needs a fix pass

### Checklist

Group all findings by area. One line per finding: describe the problem and include file + approximate line or function. Mark every item unchecked so the user can choose what to fix.

```
## Lint
- [ ] `live.js` line 142: border-radius value not wrapped in `s()`

## Structural duplication
- [ ] `editor.js` lines 310–360: three identical font/weight/size blocks — extract a shared helper

## Incomplete skill patterns
- [ ] Typography: `lineHeight` in state but no NumberInput in editor and not applied in live CSS
- [ ] Shadow: `hasShadow` toggle exists but `shadowColor` is a hex string — must use rgba and resolveShadowColor

## Settings UI
- [ ] `editor.js` Style tab colors section: missing `<Label help>` on the background color picker
- [ ] `editor.js` Edit Item drawer: `DrawerSection` for actions has no `DrawerSectionHeading`

## State completeness
- [ ] `common.js`: `buttonColor` read in `live.js` line 88 but has no default in getInitialState
```

If an area has no findings, write `- [ ] (none)` so the user can confirm it was checked.

---

> **Reminder:** Save your project in Dot.vu before applying any fixes so you have a working restore point.
