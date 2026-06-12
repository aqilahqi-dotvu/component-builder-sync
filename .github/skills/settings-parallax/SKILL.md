---
name: settings-parallax
description: "Scroll-driven scale/reveal animation for a sticky element — the component occupies a tall scroll track (scrollDistanceVh), a sticky inner container stays pinned while the page scrolls past, and a progress value (0→1) drives the visual. Includes optional bottom-reveal phase. Use when building a component where an element grows, fades, or animates as the user scrolls through a tall viewport-height track."
---

# Parallax Scroll Effect

Use this skill when a component should drive a visual animation (scale, opacity, transform, etc.) by how far the user has scrolled through a tall scroll track pinned to the viewport.

Read first: the `scroll-runtime` skill for the scroll source detection helpers, and [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md).

---

## How it works

1. The component's root element is **tall** — its height is set to `scrollDistanceVh` viewport-heights so the page has room to scroll past it.
2. A **sticky inner container** is pinned at `top: 0` with `height: 100vh`, keeping the visual locked to the viewport while the outer element scrolls.
3. A `progress` value (0 → 1) is computed from how far the component has scrolled through its own height.
4. `progress` drives whatever visual you want — scale, opacity, translateY, etc.

Optionally, a **bottom reveal phase** reserves the last portion of the scroll track to run a secondary animation (e.g. sliding bottom content into view) after the main animation completes.

---

## State fields

Add these to `common.js` before `...state`, then re-normalize after:

```js
// Before ...state
initialScalePercent: 45,   // starting scale of the element (20–100)
scrollDistanceVh: 220,     // total scroll track height in vh (120–600)
bottomRevealVh: 40,        // scroll reserved for bottom reveal phase (0 = disabled)
bottomMoveUpPx: 40,        // px the bottom element travels upward during reveal
```

After `...state` (re-normalization is not strictly required for these because they are not breakpoint-sensitive, but include it for robustness):

```js
// These are plain numbers — no re-normalization needed unless you add breakpoint variants.
```

---

## editor.js — Behavior tab

Add a **SCROLL MOTION** section inside a Behavior tab. Include the preview info note below the inputs.

```jsx
<Tab id="behavior" title="Behavior">
  <Section>
    <div className="cmp-settings-section-heading">scroll motion</div>
    <SettingItem>
      <Label content="Initial Size (%)" help="How big the element starts before scrolling." />
      <NumberInput
        value={state.initialScalePercent}
        min={20}
        max={100}
        step={1}
        onChange={(initialScalePercent) => setState({ ...state, initialScalePercent })}
      />
    </SettingItem>
    <SettingItem>
      <Label
        content="Scroll Distance (vh)"
        help="Height of the scroll track. Larger values make the animation happen over a longer scroll."
      />
      <NumberInput
        value={state.scrollDistanceVh}
        min={120}
        max={600}
        step={10}
        onChange={(scrollDistanceVh) => setState({ ...state, scrollDistanceVh })}
      />
    </SettingItem>
    <SettingItem>
      <Label
        content="Bottom Reveal (vh)"
        help="Extra scroll time after the main animation completes, during which the bottom section slides up into view. Set to 0 to disable."
      />
      <NumberInput
        value={state.bottomRevealVh}
        min={0}
        max={200}
        step={10}
        onChange={(bottomRevealVh) => setState({ ...state, bottomRevealVh })}
      />
    </SettingItem>
    <SettingItem>
      <Label
        content="Bottom Move Up (px)"
        help="How many pixels the bottom section slides upward during the reveal phase."
      />
      <NumberInput
        value={state.bottomMoveUpPx}
        min={0}
        max={300}
        step={5}
        onChange={(bottomMoveUpPx) => setState({ ...state, bottomMoveUpPx })}
      />
    </SettingItem>
    <SettingItem>
      <div className="cmp-settings-note">
        This component uses real scroll position. For best preview, click Preview in the studio and scroll the page.
      </div>
    </SettingItem>
  </Section>
</Tab>
```

Replace `cmp-` with your component's own class prefix.

### Info note style

Add this CSS to the component's `ScopedStyle` block in `editor.js`:

```css
.cmp-settings-note {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1.45;
}
```

---

## live.js — scroll tracking and progress

### 1. Imports and helpers

The scroll source detection helpers live in the `scroll-runtime` skill. Copy `isScrollableElement`, `getScrollSource`, and `getViewportMetrics` from there (or from an existing component that uses them).

You also need `clamp`:

```js
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
```

### 2. State

Inside `Component`, declare progress and a ref for the root element:

```js
const rootRef = useRef(null)
const [progress, setProgress] = useState(0)

const trackVh = clamp(Number(state.scrollDistanceVh) || 220, 120, 600)
const initialScale = clamp(Number(state.initialScalePercent) || 45, 20, 100) / 100
```

### 3. Split the scroll track

```js
const safeProgress = clamp(progress, 0, 1)

// Bottom reveal phase
const totalScrollVh = Math.max(trackVh - 100, 1)
const safeBottomRevealVh = clamp(
  Number(state.bottomRevealVh) || 0,
  0,
  Math.max(totalScrollVh - 20, 0)
)
const bottomFraction = safeBottomRevealVh > 0 ? safeBottomRevealVh / totalScrollVh : 0
const imageFraction = 1 - bottomFraction

// Main animation progress (0→1 over the first imageFraction of the track)
const mainProgress = imageFraction > 0
  ? clamp(safeProgress / imageFraction, 0, 1)
  : safeProgress

// Secondary animation progress (0→1 over the last bottomFraction of the track)
const bottomProgress = bottomFraction > 0
  ? clamp((safeProgress - imageFraction) / bottomFraction, 0, 1)
  : 0

// Example: scale from initialScale → 1
const currentScale = initialScale + (1 - initialScale) * mainProgress

// Example: bottom content slides up
const bottomMoveUpPx = clamp(Number(state.bottomMoveUpPx) || 0, 0, 300)
const bottomOffsetPx = bottomMoveUpPx * (1 - bottomProgress)
```

### 4. Scroll effect

```js
useEffect(() => {
  const container = rootRef.current
  if (!container || typeof window === 'undefined') return undefined

  const scrollSource = getScrollSource(container)
  let frameId = null

  const updateProgress = () => {
    if (!rootRef.current) return
    const { relativeTop, viewportHeight } = getViewportMetrics(rootRef.current, scrollSource)
    const containerHeight = rootRef.current.getBoundingClientRect().height
    const scrollDistance = Math.max(containerHeight - viewportHeight, 1)
    const nextProgress = clamp(-relativeTop / scrollDistance, 0, 1)
    setProgress((prev) =>
      Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress
    )
  }

  const scheduleUpdate = () => {
    if (frameId !== null) cancelAnimationFrame(frameId)
    frameId = requestAnimationFrame(() => {
      frameId = null
      updateProgress()
    })
  }

  if (scrollSource.isWindow) {
    window.addEventListener('scroll', scheduleUpdate, true)
  } else {
    scrollSource.node.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', scheduleUpdate, true)
  }
  window.addEventListener('resize', scheduleUpdate)
  scheduleUpdate()

  return () => {
    if (scrollSource.isWindow) {
      window.removeEventListener('scroll', scheduleUpdate, true)
    } else {
      scrollSource.node.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate, true)
    }
    window.removeEventListener('resize', scheduleUpdate)
    if (frameId !== null) cancelAnimationFrame(frameId)
  }
}, [trackVh])
```

> The dependency is `[trackVh]` — the effect re-binds when scroll distance changes.

### 5. JSX structure

The root must be tall (`height: ${trackVh}vh`) so there is scroll room. The sticky container is pinned at the top:

```jsx
<div ref={rootRef} className="cmp-root" style={{ height: `${trackVh}vh` }}>
  {/* sticky viewport-height frame */}
  <div className="cmp-sticky">
    {/* animated element */}
    <div
      className="cmp-stage"
      style={{
        transform: `scale(${currentScale})`,
        borderRadius: `${s(radius)}px`,
      }}
    >
      {/* content */}
    </div>

    {/* optional bottom content that slides up */}
    <div
      className="cmp-bottom"
      style={{ transform: `translateY(${s(bottomOffsetPx)}px)` }}
    >
      {/* bottom content */}
    </div>
  </div>
</div>
```

### 6. CSS

```css
.cmp-root {
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

.cmp-sticky {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.cmp-stage {
  width: 100%;
  height: 100%;
  will-change: transform;
  transform-origin: center center;
  transition: transform 0.06s linear;
}
```

---

## Key rules

- **Never use CSS `@media` queries** for the scroll behavior — everything is driven by JS.
- **Always clamp `progress`** to 0–1 before using it in calculations.
- **The `trackVh` dependency** in the scroll `useEffect` is intentional — the scroll distance changes when the user adjusts Scroll Distance in the editor, so the listener must re-bind.
- **Sticky requires `overflow: visible`** on the root (or any ancestor that wraps it). Do not put `overflow: hidden` on the root.
- **Bottom reveal is optional** — when `bottomRevealVh` is 0, `bottomFraction` is 0 and `bottomProgress` stays 0, so the secondary animation is effectively disabled.

---

## Checklist

- [ ] `scrollDistanceVh`, `initialScalePercent`, `bottomRevealVh`, `bottomMoveUpPx` added to `common.js`
- [ ] Behavior tab has **SCROLL MOTION** section with all four inputs and the preview note
- [ ] Info note CSS added to the editor `ScopedStyle`
- [ ] Scroll source detection helpers copied from `scroll-runtime` skill
- [ ] `progress` state and `rootRef` declared in `Component`
- [ ] `trackVh` clamped from `state.scrollDistanceVh`
- [ ] Scroll `useEffect` depends on `[trackVh]`
- [ ] `mainProgress` and `bottomProgress` derived from split track fractions
- [ ] Root element height set to `${trackVh}vh`
- [ ] Sticky container is `position: sticky; top: 0; height: 100vh`
- [ ] Root has `overflow: visible` (not `overflow: hidden`)
