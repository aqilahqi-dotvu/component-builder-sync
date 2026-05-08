---
mode: ask
description: Review a Dot.vu component for team standards and runtime safety
---

# Review Dot.vu Component

Use this prompt to audit a working component for team standards compliance. Do not apply fixes — report findings only. If fixes are needed, use `fix-component` after the review.

Review the current Dot.vu component against team standards.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:common.js
#file:editor.js
#file:live.js

## Review areas

### File structure

- Exactly `common.js`, `editor.js`, and `live.js` used for runtime code
- No unnecessary dependencies or runtime files
- Exports appear once per file

### State

- `getInitialState` has rich defaults
- New fields are before `...state`
- Dynamic list items have stable ids from `getUniqueId()`

### Editor settings

- Uses `Tabs`, `Tab`, `Section`, `SettingItem`, and `Label` consistently
- Settings are grouped into meaningful sections with component-prefixed heading classes such as `.faq-settings-section-heading`
- Dependent controls are hidden until the parent toggle is enabled
- No `Checkbox description` prop
- Every `Button` has `style="primary"` or `style="secondary"`
- Help article exists and matches the component

### Dynamic lists

- Editable arrays use `TableContainer`
- Reorderable lists have a drag handle first column
- Row actions use `OptionsMenuRootButton` last column
- Edit, Duplicate, Delete are present
- Details edit in `Drawer` with `DrawerSection`
- No Save or Cancel buttons in the drawer

### Live rendering

- `live.js` uses exactly one `ScopedStyle` block
- No raw `<style>` tags
- Class names are component-prefixed rather than generic names like `root`, `card`, or `container`
- `useScaler` imported and used
- `const { s } = useScaler()` is the first line inside `Component`
- Every pixel value is wrapped in `s()`
- `s()` is not used outside `Component`
- Root uses `width: '100%'`
- Root height matches `getSizeTypes`
- Root and major containers use `box-sizing: border-box`
- No `maxWidth`, `minWidth`, or fixed container widths

### Height behavior

- `// HEIGHT_PATTERN:` matches the implementation
- CONTENT_BASED components use auto height and no breakpoint infrastructure
- RESIZABLE components use `height: '100%'`
- BREAKPOINT_AWARE components include the five state fields, Advanced tab, ResizeObserver, conditional `getSizeTypes`, and `.dot-component` height override

### Data, actions, triggers

- Actions are inbound behavior
- Triggers are outbound notifications
- Trigger declarations do not implement behavior
- No Audience Data unless explicitly requested
- No `@data` imports unless explicitly requested
- `getFonts` includes all live fonts
- `getLiveState` is intentional

## Output format

Return:

1. Overall status: Pass, Pass with issues, or Fail
2. Critical runtime issues
3. Consistency issues
4. Suggested fixes by file
5. Optional improvements
