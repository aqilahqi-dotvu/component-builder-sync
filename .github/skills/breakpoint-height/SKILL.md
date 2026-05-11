---
name: breakpoint-height
description: "Implement or convert BREAKPOINT_AWARE height behavior in a Dot.vu component — ResizeObserver measurement, getSizeTypes switching between RESIZABLE and CONTENT_BASED, and the .dot-component height override. Use when adding per-breakpoint height or converting an existing component to responsive height."
---

# Breakpoint Height — BREAKPOINT_AWARE Pattern

Use this skill when a component needs a height drag handle above a configured width breakpoint and switches to auto-height below it.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## How it works

- **Above breakpoint** → `getSizeTypes` returns `RESIZABLE` height → platform shows drag handle → component fills container with `height: 100%`
- **Below breakpoint (compact)** → `getSizeTypes` returns `CONTENT_BASED` → platform removes drag handle → component sizes to content with `height: auto`
- `getSizeTypes` reads `currentComponentWidth` from state, written by the ResizeObserver in `live.js`

---

## Part 1 — Reference: required code patterns

### common.js — required state fields

Add these before `...state`:

```js
hasWidthBreakpoint: true,
widthBreakpoint: 560,
previewWidthInLiveView: false,
currentComponentWidth: 0,
currentComponentHeight: 0,
```

### editor.js — getSizeTypes

```js
export function getSizeTypes(state) {
  const isNarrow =
    Boolean(state.hasWidthBreakpoint) &&
    Number(state.currentComponentWidth) > 0 &&
    Number(state.currentComponentWidth) <=
      Math.max(120, Number(state.widthBreakpoint) || 120);
  const needsResizableHeight = Boolean(state.hasWidthBreakpoint) && !isNarrow;
  return {
    width: SizeType.RESIZABLE,
    height: needsResizableHeight ? SizeType.RESIZABLE : SizeType.CONTENT_BASED,
  };
}
```

### live.js — imports and refs

```js
// HEIGHT_PATTERN: BREAKPOINT_AWARE
import React, { useEffect, useRef, useState } from "react";
```

Inside `Component`, immediately after `const { s } = useScaler()`:

```js
const containerRef = useRef(null);
const platformHeightRef = useRef(null);
const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 });
```

### live.js — ResizeObserver effect

```js
useEffect(() => {
  const element = containerRef.current;
  if (!element) return undefined;

  let frameId = 0;
  let secondFrameId = 0;
  let intervalId = 0;
  let observer = null;

  const syncMeasuredSize = (nextSize) => {
    const safeWidth = Math.round(Number(nextSize.width) || 0);
    const safeHeight = Math.round(Number(nextSize.height) || 0);
    setMeasuredSize((prev) => {
      if (prev.width === safeWidth && prev.height === safeHeight) return prev;
      return { width: safeWidth, height: safeHeight };
    });
    setState((prev) => {
      if (
        Number(prev.currentComponentWidth) === safeWidth &&
        Number(prev.currentComponentHeight) === safeHeight
      )
        return prev;
      return {
        ...prev,
        currentComponentWidth: safeWidth,
        currentComponentHeight: safeHeight,
      };
    });
  };

  const measureNow = () => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    syncMeasuredSize({ width: rect.width, height: rect.height });
  };

  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver((entries) => {
      const entry = entries && entries[0];
      if (!entry) return;
      const box = entry.contentRect || element.getBoundingClientRect();
      syncMeasuredSize({ width: box.width, height: box.height });
    });
    observer.observe(element);
  }

  measureNow();
  frameId = requestAnimationFrame(() => {
    measureNow();
    secondFrameId = requestAnimationFrame(measureNow);
  });
  intervalId = window.setInterval(measureNow, 250);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    if (secondFrameId) cancelAnimationFrame(secondFrameId);
    if (intervalId) window.clearInterval(intervalId);
    if (observer) observer.disconnect();
  };
}, [setState]);
```

### live.js — derived values

```js
const liveMeasuredWidth = Math.max(0, Number(measuredSize.width) || 0);
const measuredWidth = Math.max(
  0,
  liveMeasuredWidth || Number(state.currentComponentWidth) || 0,
);
const responsiveBreakpointWidth = Math.max(
  120,
  Number(state.widthBreakpoint) || 120,
);
const isCompactLayout =
  Boolean(state.hasWidthBreakpoint) &&
  measuredWidth > 0 &&
  measuredWidth <= responsiveBreakpointWidth;
const measurementLabel = Boolean(state.previewWidthInLiveView)
  ? `Width: ${liveMeasuredWidth || 0}px`
  : "";
const needsAutoHeight = !Boolean(state.hasWidthBreakpoint) || isCompactLayout;
```

### live.js — .dot-component height override effect

> **Why not ScopedStyle?** `ScopedStyle` injects CSS that is scoped _inside_ the component's own container. The `.dot-component` platform wrapper sits _above_ that container in the DOM, so scoped CSS cannot reach it. The only reliable fix is an imperative `useEffect` that walks up the DOM tree and sets `height` directly on the wrapper element.

```js
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  let ancestor = el.parentElement;
  while (ancestor) {
    if (ancestor.classList && ancestor.classList.contains("dot-component")) {
      if (needsAutoHeight) {
        const currentHeight = ancestor.style.height;
        if (currentHeight && currentHeight !== "auto")
          platformHeightRef.current = currentHeight;
        ancestor.style.height = "auto";
      } else if (platformHeightRef.current) {
        ancestor.style.height = platformHeightRef.current;
      }
      break;
    }
    ancestor = ancestor.parentElement;
  }
}, [needsAutoHeight]);
```

### live.js — root element

```jsx
<div
  ref={containerRef}
  style={{
    width: '100%',
    height: (Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto',
    boxSizing: 'border-box',
    position: 'relative'
  }}
>
  {measurementLabel && <div className="cmp-measurement-overlay">{measurementLabel}</div>}
```

### live.js — CSS for root and card containers

Every container that should fill height must mirror the same conditional:

```css
.cmp-root {
  width: 100%;
  height: ${(Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto'};
}

.cmp-card {
  width: 100%;
  height: ${(Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

> Hardcoding `height: auto` in CSS while the inline style says `100%` breaks the fill. Keep them in sync.

Replace the `cmp-` prefix with a short identifier for the current component.

---

## Part 2 — Conversion steps

Use this section when converting an existing component to BREAKPOINT_AWARE. Only apply when the user explicitly asks for breakpoint-aware height behavior.

### Step 1 — common.js

Add the five state fields before `...state`. Use a breakpoint value that fits the component design.

### Step 2 — editor.js

- Add an Advanced tab if it does not exist.
- Add one Responsive Width section in the Advanced tab (see the [dotvu-api skill](../dotvu-api/SKILL.md) for the full JSX template).
- Include: Enable width breakpoint, Breakpoint Width, Preview current width in live view, Measured Size controls.
- Do not duplicate existing Advanced tabs or state fields.
- Replace `getSizeTypes` with the measured-width version above.

### Step 3 — live.js

- Set `// HEIGHT_PATTERN: BREAKPOINT_AWARE` at the top.
- Add `useEffect`, `useRef`, `useState` imports.
- Preserve `const { s } = useScaler()` as the first line inside `Component`.
- Add `containerRef`, `platformHeightRef`, `measuredSize` immediately after `useScaler()`.
- Add the full ResizeObserver effect.
- Add derived values and the `.dot-component` height override effect.
- Attach `ref={containerRef}` to the outermost div.
- Root height must switch between `'100%'` and `'auto'`.
- Add measurement overlay CSS and JSX, gated behind `previewWidthInLiveView`.

---

## Checklist

- [ ] `// HEIGHT_PATTERN: BREAKPOINT_AWARE` at top of `live.js`
- [ ] Five state fields added before `...state` in `common.js`
- [ ] No duplicate breakpoint fields
- [ ] Advanced tab has one Responsive Width section
- [ ] `getSizeTypes` uses measured width logic
- [ ] `containerRef` attached to root element
- [ ] ResizeObserver writes `currentComponentWidth` / `currentComponentHeight` into state
- [ ] `.dot-component` height override effect present
- [ ] Root inline `height` switches between `'100%'` and `'auto'`
- [ ] CSS `height` on root and card containers matches inline style condition
- [ ] Measurement overlay gated behind `previewWidthInLiveView`
- [ ] Every new px value uses `s()`
