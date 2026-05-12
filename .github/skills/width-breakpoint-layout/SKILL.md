---
name: width-breakpoint-layout
description: 'Add layout stacking based on the component's own measured width, without changing height behavior. Use when a component needs to switch layouts at two configurable width thresholds (tablet and mobile) — different from breakpoint-height which changes RESIZABLE vs CONTENT_BASED height mode.'
---

# Width Breakpoint Layout

Use this skill when the component needs to change its **layout** (e.g. column count, gap, stacking) based on the component's own measured width — without changing height behavior.

Two breakpoints are supported:

- **Breakpoint 1 (BP1)** — wider threshold (e.g. 768px, tablet). Mid-width values apply at or below this.
- **Breakpoint 2 (BP2)** — narrower threshold (e.g. 480px, mobile). Compact values apply at or below this. **Must be lower than BP1** — enforced by an inline validation hint in the editor; the runtime clamps `bp2 = min(bp1 - 1, bp2)` defensively.

> This is different from the `breakpoint-height` skill, which changes the height mode between RESIZABLE and CONTENT_BASED. This pattern keeps height as-is and only drives layout changes.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## Goal

Measure the component's own rendered width using ResizeObserver. Cascade through two thresholds to pick the right value for each layout-sensitive setting. All switching is driven by JS — do **not** add CSS `@media` queries.

---

## common.js

Add these fields before `...state`:

```js
hasWidthBreakpoint: false,
widthBreakpoint: 768,    // BP1 — tablet/mid threshold
widthBreakpoint2: 480,   // BP2 — mobile/compact threshold (must be < BP1)
previewWidthInLiveView: false,
currentComponentWidth: 0,
```

For each setting that has per-breakpoint values, add three state fields (compact, mid, initial) before `...state`. Re-normalize the numeric ones after `...state`. Example for columns and card gap:

```js
// Before ...state — defaults
columns: 3,          // initial (full width)
columnsMid: 2,       // at/below BP1
columnsCompact: 1,   // at/below BP2
cardGap: 20,
cardGapMid: 12,
cardGapCompact: 8,

// After ...state — re-normalization
columns: getNumberValue(state && state.columns, 3),
columnsMid: getNumberValue(state && state.columnsMid, 2),
columnsCompact: getNumberValue(state && state.columnsCompact, 1),
cardGap: getNumberValue(state && state.cardGap, 20),
cardGapMid: getNumberValue(state && state.cardGapMid, 12),
cardGapCompact: getNumberValue(state && state.cardGapCompact, 8),
widthBreakpoint: getNumberValue(state && state.widthBreakpoint, 768),
widthBreakpoint2: getNumberValue(state && state.widthBreakpoint2, 480),
```

---

## editor.js

### ScopedStyle CSS

Add these classes alongside the component's existing ScopedStyle block:

```css
.cmp-settings-subsection-heading {
  margin: 16px 0;
  padding-top: 16px;
  color: #000000;
  font-size: 14px;
  letter-spacing: 0.02em;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}
.cmp-bp-hint {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
  margin-top: 4px;
}
.cmp-bp-hint--error {
  color: #ef4444;
  margin-top: 2px;
  margin-bottom: 8px;
}
.cmp-bp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
```

Replace `cmp-` with the component's own prefix.

### 3-column per-breakpoint input pattern

When `state.hasWidthBreakpoint` is **false**, render the setting as a normal single `SettingItem` (unchanged). When **true**, replace it with a SubSectionHeading + 3-column grid. Column order left → right is **small → large**: compact (≤ BP2) · mid (≤ BP1) · Initial.

Each column cell uses a `Label` with a `help` prop that describes when it applies:

```jsx
{
  state.hasWidthBreakpoint ? (
    <>
      <div className="cmp-settings-subsection-heading">Columns (Desktop)</div>
      <div className="cmp-bp-grid">
        <SettingItem>
          <Label
            content={`\u2264 ${Number(state.widthBreakpoint2) || 480}px`}
            help={`The number of columns shown when the component size is below ${Number(state.widthBreakpoint2) || 480}px.`}
          />
          <NumberInput
            max={6}
            min={1}
            value={state.columnsCompact}
            onChange={(val) => setState({ ...state, columnsCompact: val })}
          />
        </SettingItem>
        <SettingItem>
          <Label
            content={`\u2264 ${Number(state.widthBreakpoint) || 768}px`}
            help={`The number of columns shown when the component size is below ${Number(state.widthBreakpoint) || 768}px.`}
          />
          <NumberInput
            max={6}
            min={1}
            value={state.columnsMid}
            onChange={(val) => setState({ ...state, columnsMid: val })}
          />
        </SettingItem>
        <SettingItem>
          <Label
            content="Initial"
            help="The number of columns shown at full width."
          />
          <NumberInput
            max={6}
            min={1}
            value={state.columns}
            onChange={(val) => setState({ ...state, columns: val })}
          />
        </SettingItem>
      </div>
    </>
  ) : (
    <SettingItem>
      <Label
        content="Columns (Desktop)"
        help="Number of cards shown per row."
      />
      <NumberInput
        max={6}
        min={1}
        value={state.columns}
        onChange={(val) => setState({ ...state, columns: val })}
      />
    </SettingItem>
  );
}
```

Apply the same pattern to any other per-breakpoint setting (gap, padding, font size, etc.).

**Rules for the 3-column grid:**

- Always order columns **compact · mid · initial** (small → large) so values increase left to right.
- Use a SubSectionHeading as the label for the group — not a `Label` above the grid.
- Put the `help` text on each individual `Label` so the breakpoint value is always visible in context. Do not add a shared hint `<div>` below the grid.
- Prefix classes with the component's own name (`services-`, `carousel-`, etc.) — never use `cmp-` literally.

### Advanced tab — responsive width section

```jsx
<Tab id="advanced" title="Advanced">
  <Section>
    <div className="cmp-settings-section-heading">responsive width</div>
    <SettingItem>
      <Checkbox
        label="Enable width breakpoints"
        value={Boolean(state.hasWidthBreakpoint)}
        onChange={(val) => setState({ ...state, hasWidthBreakpoint: val })}
      />
    </SettingItem>
    {state.hasWidthBreakpoint && (
      <>
        <SettingItem>
          <Label
            content="Breakpoint 1 (px)"
            help="When the component width drops to or below this value, the mid-width values apply."
          />
          <NumberInput
            max={2000}
            min={120}
            step={1}
            value={state.widthBreakpoint}
            onChange={(val) => setState({ ...state, widthBreakpoint: val })}
          />
        </SettingItem>
        <SettingItem>
          <Label
            content="Breakpoint 2 (px)"
            help="When the component width drops to or below this value, the compact values apply. Must be lower than Breakpoint 1."
          />
          <NumberInput
            max={2000}
            min={60}
            step={1}
            value={state.widthBreakpoint2}
            onChange={(val) => setState({ ...state, widthBreakpoint2: val })}
          />
        </SettingItem>
        {Number(state.widthBreakpoint2) >= Number(state.widthBreakpoint) && (
          <div className="cmp-bp-hint cmp-bp-hint--error">
            Must be lower than Breakpoint 1 (
            {Number(state.widthBreakpoint) || 768}px)
          </div>
        )}
        <SettingItem>
          <Checkbox
            label="Show width overlay in live view"
            value={Boolean(state.previewWidthInLiveView)}
            onChange={(val) =>
              setState({ ...state, previewWidthInLiveView: val })
            }
          />
        </SettingItem>
      </>
    )}
  </Section>
</Tab>
```

Do **not** change `getSizeTypes` — height behavior stays the same **unless** the component also needs to remove the height drag handle below the breakpoint (e.g. a count-up number that should collapse to content height on mobile). In that case:

1. Update `getSizeTypes` in `editor.js` to return `CONTENT_BASED` when `isCompactLayout` is true (see the `breakpoint-height` skill for the exact pattern).
2. Add `platformHeightRef` and the imperative DOM-walking `useEffect` to `live.js` (see **`breakpoint-height` → live.js — .dot-component height override effect**).
3. Switch all container `height` CSS values to `auto` when compact (root, wrapper, and inner card containers).

> Do **not** use `ScopedStyle` to target `.dot-component`. `ScopedStyle` is scoped inside the component container and cannot reach the platform wrapper above it — the imperative DOM-walking effect is the only reliable approach.

---

## live.js

Add `useState`, `useRef`, and `useEffect` to the React import, then add `containerRef` and `measuredWidth` after `useScaler()`:

```js
const [measuredWidth, setMeasuredWidth] = useState(0);
const containerRef = useRef(null);
```

Add the ResizeObserver effect:

```js
useEffect(
  function () {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      const w = Math.round(Math.max(0, el.clientWidth));
      setMeasuredWidth(w);
      setState(function (prev) {
        if (prev.currentComponentWidth === w) return prev;
        return Object.assign({}, prev, { currentComponentWidth: w });
      });
    }

    measure();
    const frameId = window.requestAnimationFrame(measure);

    let observer;
    if (typeof window !== "undefined" && window.ResizeObserver) {
      observer = new window.ResizeObserver(measure);
      observer.observe(el);
    }

    return function () {
      window.cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
    };
  },
  [setState],
);
```

Derive breakpoint flags and resolve values:

```js
const bp1 = Math.max(120, Number(state.widthBreakpoint) || 768);
const bp2 = Math.min(
  bp1 - 1,
  Math.max(60, Number(state.widthBreakpoint2) || 480),
);
const hasBreakpoints = Boolean(state.hasWidthBreakpoint);
const atBp2 = hasBreakpoints && measuredWidth > 0 && measuredWidth <= bp2;
const atBp1 = hasBreakpoints && measuredWidth > 0 && measuredWidth <= bp1;

// Cascade pattern: atBp2 wins over atBp1 wins over initial
const resolvedColumns = atBp2
  ? Number(state.columnsCompact) || 1
  : atBp1
    ? Number(state.columnsMid) || 2
    : Number(state.columns) || 3;

const resolvedCardGap = atBp2
  ? Number(state.cardGapCompact) || 8
  : atBp1
    ? Number(state.cardGapMid) || 12
    : Number(state.cardGap) || 20;
```

Attach `ref={containerRef}` to the outermost div returned by `Component`.

> The runtime clamps `bp2 = min(bp1 - 1, bp2)` so the cascade never breaks even if the editor validation hint was not acted on.

#### Measurement overlay

```jsx
{
  Boolean(state.previewWidthInLiveView) && measuredWidth > 0 && (
    <div
      style={{
        position: "absolute",
        top: s(12),
        right: s(12),
        zIndex: 10,
        background: "rgba(17,24,39,0.78)",
        color: "#ffffff",
        fontSize: `${s(12)}px`,
        fontWeight: 600,
        padding: `${s(6)}px ${s(12)}px`,
        borderRadius: s(999),
        pointerEvents: "none",
        lineHeight: 1,
      }}
    >
      {measuredWidth}px
    </div>
  );
}
```

---

## Checklist

- [ ] Five base fields added to `common.js` before `...state` (`hasWidthBreakpoint`, `widthBreakpoint`, `widthBreakpoint2`, `previewWidthInLiveView`, `currentComponentWidth`)
- [ ] Per-breakpoint value triples (`xyzCompact`, `xyzMid`, `xyz`) added for each layout-sensitive setting
- [ ] All numeric fields re-normalized after `...state`
- [ ] ScopedStyle has subsection heading, `cmp-bp-hint`, `cmp-bp-hint--error`, and `cmp-bp-grid` classes (prefixed correctly)
- [ ] Per-breakpoint settings render as SubSectionHeading + 3-column grid when `hasWidthBreakpoint` is true, single input when false
- [ ] 3-column grid order is compact · mid · initial (small → large, left → right)
- [ ] Each column's `Label` has a `help` prop describing when that value applies
- [ ] Advanced tab has one "responsive width" section with BP1 input, BP2 input, error hint when BP2 ≥ BP1, and overlay checkbox
- [ ] `getSizeTypes` is unchanged (unless height switching is also required — see note above)
- [ ] No CSS `@media` queries used for layout switching
- [ ] `useState`, `useRef`, `useEffect` added to React import in `live.js`
- [ ] ResizeObserver effect added with proper cleanup
- [ ] `bp2` clamped to `min(bp1 - 1, bp2)` at runtime
- [ ] Values resolved with `atBp2 → atBp1 → initial` cascade
- [ ] `containerRef` attached to outermost div
- [ ] Measurement overlay shown only when `previewWidthInLiveView` is true
