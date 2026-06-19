---
name: width-breakpoint-layout
description: 'Add layout stacking based on the component\'s own measured width, without changing height behavior. Use when a component needs to switch layouts at two configurable width thresholds (Breakpoint M and Breakpoint S) — different from breakpoint-height which changes RESIZABLE vs CONTENT_BASED height mode.'
---

# Width Breakpoint Layout

Use this skill when the component needs to change its **layout** (e.g. column count, gap, stacking) based on the component's own measured width — without changing height behavior.

Two breakpoints are supported:

- **Breakpoint M (BP1)** — wider threshold (default 768px). Mid-width values apply at or below this.
- **Breakpoint S (BP2)** — narrower threshold (default 480px). Compact values apply at or below this. **Must be lower than Breakpoint M** — enforced by an inline validation hint in the editor; the runtime clamps `bp2 = min(bp1 - 1, bp2)` defensively.

The naming is intentionally size-based (L / M / S) rather than device-based (desktop / tablet / mobile) because these thresholds refer to the **component's own rendered width**, not the browser viewport.

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
widthBreakpoint: 768,    // BP1 — Breakpoint M threshold
widthBreakpoint2: 480,   // BP2 — Breakpoint S threshold (must be < BP1)
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
.cmp-bp-hint--error {
  font-size: 11px;
  color: #ef4444;
  line-height: 1.4;
  margin-top: 2px;
  margin-bottom: 8px;
}
```

Replace `cmp-` with the component's own prefix.

### Style tab — per-breakpoint column settings

When `state.hasWidthBreakpoint` is **false**, show the setting normally (single value). When **true**, show three sub-section headings — **Breakpoint L**, **Breakpoint M**, **Breakpoint S** — each with its own input.

```jsx
{
  !state.hasWidthBreakpoint ? (
    <SettingItem>
      <Label content="Columns" />
      <NumberInput
        max={6}
        min={1}
        value={state.columns}
        onChange={(val) => setState({ ...state, columns: val })}
      />
    </SettingItem>
  ) : (
    <>
      <div className="cmp-settings-subsection-heading">Breakpoint L</div>
      <SettingItem>
        <Label
          content="Columns"
          help="Applies when the component width is wider than the Breakpoint M threshold."
        />
        <NumberInput
          max={6}
          min={1}
          value={state.columns}
          onChange={(val) => setState({ ...state, columns: val })}
        />
      </SettingItem>
      <div className="cmp-settings-subsection-heading">Breakpoint M</div>
      <SettingItem>
        <Label
          content="Columns"
          help="Applies when the component width is at or below the Breakpoint M threshold."
        />
        <NumberInput
          max={6}
          min={1}
          value={state.columnsMid}
          onChange={(val) => setState({ ...state, columnsMid: val })}
        />
      </SettingItem>
      <div className="cmp-settings-subsection-heading">Breakpoint S</div>
      <SettingItem>
        <Label
          content="Columns"
          help="Applies when the component width is at or below the Breakpoint S threshold."
        />
        <NumberInput
          max={6}
          min={1}
          value={state.columnsCompact}
          onChange={(val) => setState({ ...state, columnsCompact: val })}
        />
      </SettingItem>
    </>
  );
}
```

Apply the same sub-section pattern to every other per-breakpoint setting (gap, padding, font size, etc.).

### Advanced tab — responsive width section

The breakpoint threshold values and the enable/disable toggle always live in the **Advanced** tab. The per-breakpoint layout values (columns, gaps, etc.) live in the **Style** tab under their own sub-sections.

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
            content="Breakpoint M (px)"
            help="When the component width drops to or below this value, the Breakpoint M values apply."
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
            content="Breakpoint S (px)"
            help="When the component width drops to or below this value, the Breakpoint S values apply. Must be lower than Breakpoint M."
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
            Must be lower than Breakpoint M (
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
- [ ] ScopedStyle has `cmp-bp-hint--error` class (prefixed correctly)
- [ ] Each breakpoint-sensitive setting has a `xyzBpView` local state variable and a derived `xyzKey`
- [ ] Dropdown options are `Desktop` · `≤ BP1px` · `≤ BP2px` and only rendered when `hasWidthBreakpoint` is true
- [ ] `Label` `help` prop is conditional on `state.hasWidthBreakpoint`
- [ ] Advanced tab has one "responsive width" section with BP1 input, BP2 input, error hint when BP2 ≥ BP1, and overlay checkbox
- [ ] `getSizeTypes` is unchanged (unless height switching is also required — see note above)
- [ ] No CSS `@media` queries used for layout switching
- [ ] `useState`, `useRef`, `useEffect` added to React import in `live.js`
- [ ] ResizeObserver effect added with proper cleanup
- [ ] `bp2` clamped to `min(bp1 - 1, bp2)` at runtime
- [ ] Values resolved with `atBp2 → atBp1 → initial` cascade
- [ ] `containerRef` attached to outermost div
- [ ] Measurement overlay shown only when `previewWidthInLiveView` is true
