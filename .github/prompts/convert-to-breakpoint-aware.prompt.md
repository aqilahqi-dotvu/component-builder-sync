---
agent: dotvu-component-builder
description: Convert a Dot.vu component to BREAKPOINT_AWARE height behavior
---

# Convert to BREAKPOINT_AWARE

Use this prompt only when the user explicitly asks for breakpoint-aware height behavior.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/prompts/dotvu-api-reference.prompt.md
#file:common.js
#file:editor.js
#file:live.js

## Goal

Convert the component so it has a height drag handle above a configured component-width breakpoint and switches to auto-height below that breakpoint.

## Required changes

### common.js

Add these default state fields before `...state`:

```js
hasWidthBreakpoint: true,
widthBreakpoint: 560,
previewWidthInLiveView: false,
currentComponentWidth: 0,
currentComponentHeight: 0,
```

Use a breakpoint value that fits the component design.

### editor.js

- Add an Advanced tab if it does not exist.
- Add only one Responsive Width section in the Advanced tab.
- Include Enable width breakpoint, Breakpoint Width, Preview current width in live view, and Measured Size controls.
- Do not duplicate existing Advanced tabs or state fields.

### getSizeTypes

Use this logic:

```js
export function getSizeTypes(state) {
  const isNarrow = Boolean(state.hasWidthBreakpoint)
    && Number(state.currentComponentWidth) > 0
    && Number(state.currentComponentWidth) <= Math.max(120, Number(state.widthBreakpoint) || 120)
  const needsResizableHeight = Boolean(state.hasWidthBreakpoint) && !isNarrow
  return {
    width: SizeType.RESIZABLE,
    height: needsResizableHeight ? SizeType.RESIZABLE : SizeType.CONTENT_BASED
  }
}
```

### live.js

- Set `// HEIGHT_PATTERN: BREAKPOINT_AWARE`.
- Add `useEffect`, `useRef`, and `useState` imports if needed.
- Preserve `const { s } = useScaler()` as the first line inside `Component`.
- Add `containerRef`, `platformHeightRef`, and `measuredSize` state immediately after `useScaler()`.
- Add the full ResizeObserver pattern from `dotvu-api-reference.prompt.md`.
- Add `isCompactLayout` derived from the measured component width.
- Add the imperative `.dot-component` height override.
- Root height must be `'100%'` above breakpoint and `'auto'` below breakpoint.
- Add measurement overlay CSS and JSX, gated behind `previewWidthInLiveView`.
- Adjust layout for compact mode where needed.

## Checklist

- [ ] `// HEIGHT_PATTERN: BREAKPOINT_AWARE`?
- [ ] Five state fields added before `...state`?
- [ ] No duplicate breakpoint fields?
- [ ] Advanced tab has one Responsive Width section?
- [ ] `getSizeTypes` uses measured width logic?
- [ ] ResizeObserver included?
- [ ] `.dot-component` height override included?
- [ ] Root height switches between `100%` and `auto`?
- [ ] Measurement overlay is optional and gated?
- [ ] Every new px value uses `s()`?
