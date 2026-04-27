---
description: Reference for correct BREAKPOINT_AWARE height behavior in Dot.vu live.js components
---

# Height Behavior — BREAKPOINT_AWARE

This documents the verified, working pattern for components that show a height drag handle above a breakpoint and switch to auto-height below it.

## How it works

- Above the breakpoint → `getSizeTypes` returns `RESIZABLE` height → platform shows drag handle → component fills the container with `height: 100%`
- Below the breakpoint (compact) → `getSizeTypes` returns `CONTENT_BASED` → platform removes drag handle → component sizes to content with `height: auto`
- `getSizeTypes` reads `currentComponentWidth` from state, which is written by the ResizeObserver in `live.js`

## common.js — required state fields

Add these before `...state`:

```js
hasWidthBreakpoint: true,
widthBreakpoint: 560,
previewWidthInLiveView: false,
currentComponentWidth: 0,
currentComponentHeight: 0,
```

## editor.js — getSizeTypes

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

## live.js — imports and refs

```js
// HEIGHT_PATTERN: BREAKPOINT_AWARE
import React, { useEffect, useRef, useState } from 'react'
```

Inside `Component`, immediately after `const { s } = useScaler()`:

```js
const containerRef = useRef(null)
const platformHeightRef = useRef(null)
const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 })
```

## live.js — ResizeObserver effect

```js
useEffect(() => {
  const element = containerRef.current
  if (!element) return undefined

  let frameId = 0
  let secondFrameId = 0
  let intervalId = 0
  let observer = null

  const syncMeasuredSize = nextSize => {
    const safeWidth = Math.round(Number(nextSize.width) || 0)
    const safeHeight = Math.round(Number(nextSize.height) || 0)
    setMeasuredSize(prev => {
      if (prev.width === safeWidth && prev.height === safeHeight) return prev
      return { width: safeWidth, height: safeHeight }
    })
    setState(prev => {
      if (Number(prev.currentComponentWidth) === safeWidth && Number(prev.currentComponentHeight) === safeHeight) return prev
      return { ...prev, currentComponentWidth: safeWidth, currentComponentHeight: safeHeight }
    })
  }

  const measureNow = () => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    syncMeasuredSize({ width: rect.width, height: rect.height })
  }

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(entries => {
      const entry = entries && entries[0]
      if (!entry) return
      const box = entry.contentRect || element.getBoundingClientRect()
      syncMeasuredSize({ width: box.width, height: box.height })
    })
    observer.observe(element)
  }

  measureNow()
  frameId = requestAnimationFrame(() => {
    measureNow()
    secondFrameId = requestAnimationFrame(measureNow)
  })
  intervalId = window.setInterval(measureNow, 250)

  return () => {
    if (frameId) cancelAnimationFrame(frameId)
    if (secondFrameId) cancelAnimationFrame(secondFrameId)
    if (intervalId) window.clearInterval(intervalId)
    if (observer) observer.disconnect()
  }
}, [setState])
```

## live.js — derived values

```js
const liveMeasuredWidth = Math.max(0, Number(measuredSize.width) || 0)
const measuredWidth = Math.max(0, liveMeasuredWidth || Number(state.currentComponentWidth) || 0)
const responsiveBreakpointWidth = Math.max(120, Number(state.widthBreakpoint) || 120)
const isCompactLayout = Boolean(state.hasWidthBreakpoint) && measuredWidth > 0 && measuredWidth <= responsiveBreakpointWidth
const measurementLabel = Boolean(state.previewWidthInLiveView) ? `Width: ${liveMeasuredWidth || 0}px` : ''
const needsAutoHeight = !Boolean(state.hasWidthBreakpoint) || isCompactLayout
```

## live.js — .dot-component height override effect

This imperatively keeps the platform wrapper in sync when the pattern switches modes:

```js
useEffect(() => {
  const el = containerRef.current
  if (!el) return
  let ancestor = el.parentElement
  while (ancestor) {
    if (ancestor.classList && ancestor.classList.contains('dot-component')) {
      if (needsAutoHeight) {
        const currentHeight = ancestor.style.height
        if (currentHeight && currentHeight !== 'auto') platformHeightRef.current = currentHeight
        ancestor.style.height = 'auto'
      } else if (platformHeightRef.current) {
        ancestor.style.height = platformHeightRef.current
      }
      break
    }
    ancestor = ancestor.parentElement
  }
}, [needsAutoHeight])
```

## live.js — root element

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
  {measurementLabel && <div className="measurement-overlay">{measurementLabel}</div>}
```

## live.js — CSS for root and card containers

Every container that should fill height must mirror the same conditional:

```css
.root {
  width: 100%;
  height: ${(Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto'};
}

.card {
  width: 100%;
  height: ${(Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

> Hardcoding `height: auto` in CSS while the inline style says `100%` breaks the fill. Keep them in sync.

## Checklist

- [ ] `// HEIGHT_PATTERN: BREAKPOINT_AWARE` at top of `live.js`
- [ ] Five state fields added before `...state` in `common.js`
- [ ] `getSizeTypes` uses measured width logic
- [ ] `containerRef` attached to root element
- [ ] ResizeObserver writes `currentComponentWidth` / `currentComponentHeight` into state
- [ ] `.dot-component` height override effect present
- [ ] Root inline `height` switches between `'100%'` and `'auto'`
- [ ] CSS `height` on root and card containers matches inline style condition
- [ ] Content centered with `align-items: center` + `justify-content: center`
- [ ] Measurement overlay gated behind `previewWidthInLiveView`
