---
applyTo: "**/{common,editor,live}.js,**/{common,editor,live}/index.js"
---

# Dot.vu Component Instructions

These instructions apply when creating, editing, reviewing, or fixing Dot.vu AI Components.

## Runtime files

A component has exactly three runtime files:

- `common.js` - initial state and shared logic
- `editor.js` - settings UI, data fields, actions, triggers, fonts, size types, and live state
- `live.js` - rendered component, scoped styles, action handlers, and runtime behavior

Some older examples may use `/common/index.js`, `/editor/index.js`, and `/live/index.js`. For this repository, use the existing file layout. If the project already has `common.js`, `editor.js`, and `live.js`, preserve that structure.

## Allowed imports

Do not invent imports. Use only these unless the user explicitly confirms another Dot.vu API exists.

- `react`: `React`, `useState`, `useEffect`, `useRef`, `useMemo`
- `@ui`: `TextInput`, `NumberInput`, `Checkbox`, `FontSelector`, `ColorPicker`, `SvgPicker`, `Dropdown`, `Tabs`, `Tab`, `Section`, `SettingItem`, `Label`, `TableContainer`, `OptionsMenuRootButton`, `Drawer`, `DrawerSection`, `Button`, `ImagePicker`
- `@utils`: `getUniqueId`, `ScopedStyle`
- `@hooks`: `useScaler`
- `@constants`: `SizeType`
- `@icons`: editor only: `deleteIcon`, `duplicateIcon`, `editIcon`, `settingsIcon`
- `@common/index`: `getInitialState`
- `@data`: only when explicitly requested: `createDynamicValue`, `resolveDynamicValue`, `resolveDynamicValues`, `useDynamicValues`, `runActionSet`

If the needed editor element has no allowed `@ui` component, ask the user before using plain HTML.

## Non-negotiable rules

- Use `<ScopedStyle>` for styles. Never use raw `<style>` tags.
- Import and use `useScaler` in `live.js`.
- `const { s } = useScaler()` must be the first line inside `Component`.
- Use `s()` for every pixel value in `live.js`: font sizes, margins, padding, gaps, borders, border radius, positions, shadows, media queries, and dimensions.
- Do not call `s()` outside `Component`, including helpers and `getActionHandlers`.
- Use unitless `line-height` values when possible. If line height is in pixels, wrap the pixel number in `s()`.
- Use `box-sizing: border-box` on the root and major containers.
- The root live element must use `width: '100%'` or equivalent.
- Use `height: '100%'` only when height is `SizeType.RESIZABLE` or when the BREAKPOINT_AWARE pattern says the current layout is resizable.
- Do not use `maxWidth`, `minWidth`, fixed container widths, or fixed layout caps.
- Use `<SettingItem>` for every label/input pair.
- Do not use the `description` prop on `<Checkbox>`. Put help text on a nearby `<Label help="..." />` inside the same `<SettingItem>`.
- Every `<Button>` must include `style="primary"` or `style="secondary"`.
- Use `getUniqueId()` for all dynamic list item ids.
- Do not add Save or Cancel buttons inside `<Drawer>`. Drawer edits save immediately.
- Always wrap `<Drawer>` content in `<DrawerSection>`.
- Keep the `// HEIGHT_PATTERN:` comment at the top of `live.js` accurate.
- Each exported function must appear exactly once per file. When editing, replace the existing function instead of appending a second copy.

## State defaults

Use rich, realistic defaults so the component works immediately after creation.

In `common.js`, add new defaults before `...state` so saved state wins:

```js
export function getInitialState(state) {
  return {
    heading: 'Component Title',
    description: 'Add a useful default description.',
    ...state
  }
}
```

When adding a new state field to an existing component, add it before `...state` and keep existing saved values intact.

## Settings UI standard

Use `<Tabs defaultActiveTab="content">` as the root for most settings panels.

Standard tabs:

- Content - copy, images, lists, data, and item management
- Style - typography, colors, layout, spacing, borders, shadow
- Advanced - only for BREAKPOINT_AWARE components
- Animation - only when animation is requested

Inside each tab, group controls into `<Section>` blocks. Do not leave a tab as one long flat list.

Use a heading for each meaningful group:

```jsx
<div className="settings-section-heading">typography</div>
```

Use lowercase heading labels such as `copy`, `items`, `typography`, `colors`, `layout`, `shadow`, `responsive width`, and `motion`.

Include this editor scoped style when headings are used:

```css
.settings-section-heading {
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.settings-sub-section-heading {
  margin: 12px 0;
  color: #000000;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-transform: capitalize;
}
```

Hide dependent controls until their parent toggle is enabled.

## Height behavior

Choose the simplest correct height behavior.

### CONTENT_BASED

Default for forms, text blocks, cards, quizzes, surveys, and vertically flowing content.

- `getSizeTypes`: `height: SizeType.CONTENT_BASED`
- Live root: `height: 'auto'`
- No Advanced tab
- No BREAKPOINT_AWARE state fields
- No measurement overlay
- No `.dot-component` height override unless separately required

### RESIZABLE

Use only for components that must fill a user-defined height, such as maps, galleries, visual panels, media players, and fixed-height hero blocks.

- `getSizeTypes`: `height: SizeType.RESIZABLE`
- Live root: `height: '100%'`
- No Advanced tab unless another explicitly requested advanced setting exists

### BREAKPOINT_AWARE

Use only when the user asks for a height drag handle above a width breakpoint and auto-height below it.

Must include:

- `hasWidthBreakpoint`
- `widthBreakpoint`
- `previewWidthInLiveView`
- `currentComponentWidth`
- `currentComponentHeight`
- Advanced tab with Responsive Width section
- ResizeObserver in `live.js`
- `getSizeTypes` conditional height logic
- Imperative `.dot-component` height override
- Optional measurement overlay gated by `previewWidthInLiveView`

Do not add BREAKPOINT_AWARE infrastructure to ordinary content-based components.

## Dynamic lists and tables

For any editable array/list setting, use the master-detail pattern:

- `<TableContainer>` for the list
- Drag handle as the first compact column when order matters
- `<OptionsMenuRootButton>` as the last compact column
- At minimum: Edit, Duplicate, Delete
- `<Drawer>` plus `<DrawerSection>` for detailed editing
- No Save or Cancel buttons in the drawer
- Stable item ids generated by `getUniqueId()`

The list should support add, edit, duplicate, delete, and reorder unless a specific action is inappropriate.

## Actions, triggers, and data

- Actions are inbound. External logic calls them to make the component do something.
- Triggers are outbound. The component fires them so external logic can react.
- Component behavior should be implemented with component state and normal code, not inside trigger declarations.
- `Start Animation` is the standard action name for animation components.
- Do not expose audience data unless explicitly requested.
- Do not import `@data` or use dynamic values unless explicitly requested.

## Required editor exports

Include these exports when relevant:

- `getSettings`
- `getDataFields`
- `getActions`
- `getTriggers`
- `getFonts`
- `getSizeTypes`
- `getLiveState`

`getSettings` must include a useful help article.

`getFonts` must return all fonts used in live rendering and filter empty values.

`getLiveState` should return `state` unless there is a clear reason to remove editor-only fields.

## Final response style

When editing in agent mode, edit files in place. Then summarize:

- Files changed
- Main behavior added or changed
- Any assumptions or follow-up checks

Do not return a three-file code manifest unless the user explicitly asks for copy/paste output.

## Boilerplate reference

Use `/templates/boilerplate.md` as the reference implementation for Dot.vu component patterns.

Do not copy the boilerplate blindly and do not start every component from it unless explicitly asked.

Use it to understand and apply established patterns such as:

- file structure and export order
- `getInitialState` defaults and saved-state preservation
- settings tab structure
- `Tabs`, `Section`, `SettingItem`, and heading patterns
- `TableContainer` + `Drawer` list editing
- drag-and-drop reorder behavior
- duplicate/delete behavior
- `getUniqueId()` usage
- `ScopedStyle`
- `useScaler`
- sizing and height behavior
- responsive breakpoint behavior
- animation setup when relevant

When creating or editing a component:
- read the current component files first if they exist
- consult `/templates/boilerplate.md` only for patterns that are relevant to the requested feature
- adapt the pattern to the current component’s domain
- preserve existing state fields and behavior unless the user requests changes
- do not introduce boilerplate features that were not requested