Here’s the rewritten `/review-component` prompt:

```md
---
agent: agent
description: Audit a Dot.vu component for lint, repeated code, settings UI quality, button completeness, and common QA blockers. Ends with a fix plan for approval before implementation.
---

# Review Dot.vu Component

Read these files before starting:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/instructions/component-structure.instructions.md
#file:common.js
#file:editor.js
#file:live.js

Work through each area below. Report every finding. Do not apply fixes yet.

---

## 1. Lint checks

Run `npm run lint` and report all errors and warnings before doing any manual checks.

- No unused imports or variables
- No duplicate function or export definitions; each export appears exactly once per file
- No raw `<style>` tags; only `<ScopedStyle>`
- No `s()` calls outside `Component`
- `const { s } = useScaler()` is the first line inside `Component`
- Every pixel value in `live.js` is wrapped in `s()`
- Root element uses `width: '100%'`
- Root and major containers use `box-sizing: border-box`
- No `maxWidth`, `minWidth`, or fixed container widths
- `// HEIGHT_PATTERN:` comment matches actual implementation
- `getInitialState` puts all new fields before `...state`

## 2. Repeated code

- Identify any blocks of JSX, logic, or CSS that appear more than once and could be extracted into a small reusable helper or render piece
- Flag inline logic that is duplicated across event handlers or render branches
- Only flag extraction when reuse or readability clearly benefits; do not flag one-off inline blocks

## 3. Component info

Check the `help()` function inside `getSettings` in `editor.js` for these required elements:

- `name` matches the component's actual display name
- `title` is `"{name} Help"`
- `content` opens with `<h1>{Component Name}</h1>` followed by a one-sentence `<p>` description
- `content` includes `<h3><strong>How it works</strong></h3>` with a `<ul>` of core behaviors
- `content` includes `<h3><strong>Tabs and settings overview</strong></h3>` with an `<h4><strong>{Tab Name} tab</strong></h4>` block for every tab that has user-facing settings
- `content` includes `<h3><strong>Tips for a great experience</strong></h3>` with actionable tips
- Every setting described in the help content still exists in `editor.js`; flag any stale references
- Every editor tab with user-facing settings has a corresponding `<h4>` block; flag any missing tabs
- Actions and triggers named in the help content match what `getActions` and `getTriggers` actually export

## 4. Button completeness

- Every interactive button in `live.js` has a clear action: an `onClick` handler, a URL, or an `ActionSet`
- Every `<Button>` in `editor.js` has `style="primary"` or `style="secondary"`
- Reset, submit, and success-screen buttons all have wired handlers
- Flag any button with no handler or an empty/undefined action

## 5. Settings sections and headings

- Settings panel uses `<Tabs defaultActiveTab="content">` as root
- Each tab groups controls into `<Section>` blocks; no flat unsectioned lists
- Each meaningful group has a component-prefixed heading element such as `<div className="faq-settings-section-heading">copy</div>`
- Sub-groups use a sub-section heading element such as `<div className="faq-settings-sub-section-heading">label</div>`
- Heading styles match the standard block from the component instructions: uppercase, 12px, 700 weight for section headings; capitalize, 12px, 700 for sub-section headings
- Dependent controls are hidden until their parent toggle is on
- No `description` prop on `<Checkbox>`; help text goes on a nearby `<Label help="..." />`
- Every label/input pair uses `<SettingItem>`

## 6. Skills format compliance

- Editable arrays use `TableContainer`; add `Drawer` + `DrawerSection` only when rows have an Edit action
- Reorderable lists have a drag handle as the first compact column
- Row actions use a single `IconButton` with `deleteIcon` when delete is the only action
- Row actions use `OptionsMenuRootButton` as the last compact column when multiple actions such as Edit, Duplicate, and Delete are needed
- No Save or Cancel buttons inside any `<Drawer>`
- Shadow settings, if present, follow the `settings-shadow` skill pattern
- Border radius settings, if present, follow the `settings-border-radius` skill pattern
- Padding settings, if present, follow the `settings-padding` skill pattern
- Typography settings, if present, follow the `settings-font` skill pattern
- Animation settings, if present, follow the `settings-animation` skill pattern
- Width-based layout stacking, if present, follows the `width-breakpoint-layout` skill pattern
- No CSS `@media` queries for component layout switching; layout switching must be driven by a ResizeObserver measuring the component's own width
- Checkboxes follow the `settings-checkbox` skill pattern: `value` prop, not `checked`; `onChange` receives a boolean directly, not an event; required `label` prop; no `description` prop on `<Checkbox>`

## 7. QA readiness checks

Check for common QA failures before the component is passed to QA.

- Clickable non-button elements in `live.js` include the `dot-ct` class when they use `onClick`, `onMouseDown`, or similar pointer/click handlers
- `dot-ct` is especially required for clickable `<div>`, `<span>`, card, accordion, FAQ, carousel, gallery, tab, hotspot, or custom control elements that may be used inside Flipbook
- Native `<button>`, `<a>`, and form controls do not need `dot-ct` unless the component behavior requires it
- Components that collect audience/user data define every persisted field in `getDataFields` with `audience: true` where appropriate
- Audience data field keys match actual state property names exactly
- Values are stored in component state before calling `saveAudienceData`
- `saveAudienceData([...])` is called with an array of state property names after the relevant values are stored in state
- Form-like components preserve submitted values long enough for `saveAudienceData` to persist them
- Master components use Default Font-compatible typography rather than account-specific fonts that may not exist after publishing to Building Blocks
- Width-based layout changes use ResizeObserver/component width, not CSS breakpoints or viewport media queries
- Breakpoint values and layout thresholds that depend on component scaling are scaled with `s()`, especially when the component can be resized with the bottom-right scale handler
- Scaling down the component should not accidentally trigger a different layout unless the scaled component width genuinely crosses the scaled breakpoint

---

## Output format

After completing all checks, return:

### Findings

List every issue grouped by the seven areas above. For each issue include:

- **Area** and **file**
- **What was found**
- **Why it matters**

If no issues are found in an area, state that clearly for that area.

### Fix plan

Produce a numbered list of concrete fixes in priority order:

1. Critical runtime or QA-blocking issues first
2. Missing or broken wiring, including buttons, handlers, and audience data persistence
3. Responsive/scaling issues, including ResizeObserver, `s()`, and breakpoint behavior
4. Settings UI gaps, headings, sections, and skill patterns
5. Repeated code extractions
6. Component info updates
7. Optional improvements

Label each item as **[Critical]**, **[Required]**, or **[Optional]**.

State clearly: _"Review the plan and tell me which items to skip. Then I will implement the approved items."_
```
