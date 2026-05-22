---
name: responsive-grid
description: Complete responsive grid pattern for Dot.vu components — dual-mode layout (auto-wrap flex OR fixed CSS grid columns), ResizeObserver width measurement, two-breakpoint column switching, gap and alignment controls, and the debug width overlay. Use this as the starter grid foundation whenever a component arranges items in a multi-column responsive layout.
---

# Responsive Grid

Use this skill when a component needs to lay out items in a responsive multi-column grid. The pattern supports two modes that the user can toggle in the editor:

- **Auto-wrap mode (default)** — items flow with `flexbox`. Columns form naturally based on a minimum item width. No breakpoints needed.
- **Fixed-columns mode** — switches to `CSS grid`. Two width thresholds (BP1 and BP2) lock the exact column count at each size.

Both modes are driven by the component's **own measured width** (via `ResizeObserver`), not the browser viewport. This makes them work correctly inside Dot.vu's panel-based editor.

> **Relationship to other skills**
>
> - `width-breakpoint-layout` — explains how to bolt the breakpoint mechanism onto an existing component. Use that when converting an existing component.
> - `responsive-grid` — provides the complete grid starter pattern including both auto-wrap and fixed-columns modes. Use this when building a new grid-based component from scratch.

---

## How the two modes differ

|              | Auto-wrap (default)                                        | Fixed-columns                                 |
| ------------ | ---------------------------------------------------------- | --------------------------------------------- |
| CSS display  | `flex; flex-wrap: wrap`                                    | `grid; grid-template-columns: repeat(N, 1fr)` |
| Column count | Derived from `floor((width + gap) / (minItemWidth + gap))` | Set explicitly per breakpoint                 |
| Item width   | Computed from measured width                               | `1fr` (equal, no min)                         |
| Enabled by   | `hasWidthBreakpoint: false`                                | `hasWidthBreakpoint: true`                    |
| Settings     | Min Item Width, Gap, Alignment                             | Breakpoint px values, Columns per breakpoint  |

---

## 1. common.js — state fields

Add these fields before `...state`. Use your component's own prefix instead of `grid`.

```js
// Grid layout — auto-wrap mode
hasWidthBreakpoint: false,
minItemWidth: 240,       // minimum px width before items wrap to next row
itemGap: 24,             // gap between items (px, pre-scale)
itemAlignment: 'start',  // justify-content in flex mode: 'start' | 'center' | 'end'

// Grid layout — fixed-columns mode (active when hasWidthBreakpoint is true)
widthBreakpoint: 768,    // BP1 — mid threshold (px)
widthBreakpoint2: 480,   // BP2 — compact threshold (px, must be < BP1)
maxColumns: 3,           // columns at full width
maxColumnsMid: 2,        // columns at or below BP1
maxColumnsCompact: 1,    // columns at or below BP2

// Debug
previewWidthInLiveView: false,
currentComponentWidth: 0,
```

If you need per-breakpoint gap or padding, add sibling fields (`itemGapMid`, `itemGapCompact`) following the same `<compact> · <mid> · <initial>` naming pattern.

---

## 2. live.js — width measurement

Place this at the top of your `Component` function, before any derived values.

```jsx
// --- Width breakpoint measurement ---
const [measuredWidth, setMeasuredWidth] = useState(0);
const containerRef = useRef(null);

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

Attach `ref={containerRef}` to the outermost wrapper `<div>`. The wrapper must have `width: 100%` and `position: relative` so the measurement is stable.

---

## 3. live.js — derived grid values

Place these after width measurement, before styles.

```js
// --- Derived grid values ---
const bp1 = Math.max(120, Number(state.widthBreakpoint) || 768);
const bp2 = Math.min(
  bp1 - 1,
  Math.max(60, Number(state.widthBreakpoint2) || 480),
);
const hasBreakpoints = Boolean(state.hasWidthBreakpoint);
const atBp2 = hasBreakpoints && measuredWidth > 0 && measuredWidth <= bp2;
const atBp1 = hasBreakpoints && measuredWidth > 0 && measuredWidth <= bp1;

// Fixed-columns mode: resolve active column count
const resolvedCols = atBp2
  ? Math.max(1, Math.min(6, Number(state.maxColumnsCompact) || 1))
  : atBp1
    ? Math.max(1, Math.min(6, Number(state.maxColumnsMid) || 2))
    : Math.max(1, Math.min(6, Number(state.maxColumns) || 3));

// Auto-wrap mode: compute natural column count from measured width
const itemGapRaw = Number(state.itemGap) || 24;
const minItemWidthRaw = Number(state.minItemWidth) || 240;
const resolvedGap = s(itemGapRaw);

const simpleColCount =
  !hasBreakpoints && measuredWidth > 0
    ? Math.max(
        1,
        Math.floor(
          (measuredWidth + itemGapRaw) / (minItemWidthRaw + itemGapRaw),
        ),
      )
    : 1;
const colWidth =
  !hasBreakpoints && measuredWidth > 0
    ? (measuredWidth - (simpleColCount - 1) * resolvedGap) / simpleColCount
    : minItemWidthRaw;
```

---

## 4. live.js — CSS grid styles

Inline this inside the scoped `styles` template literal. The key lines are `.grid` and `.item-wrap`:

```css
.cmp-grid {
  display: ${hasBreakpoints ? 'grid' : 'flex'};
  ${hasBreakpoints
    ? `grid-template-columns: repeat(${resolvedCols}, 1fr);`
    : 'flex-wrap: wrap;'}
  justify-content: ${state.itemAlignment || 'start'};
  gap: ${resolvedGap}px;
}
.cmp-item-wrap {
  ${hasBreakpoints
    ? 'min-width: 0;'
    : `width: ${colWidth}px; min-width: 0;`}
}
```

Replace `cmp-` with your component prefix.

In JSX, the grid root must be the measured `containerRef` wrapper with a child for the grid itself:

```jsx
<div
  ref={containerRef}
  style={{ position: "relative", width: "100%", boxSizing: "border-box" }}
>
  <ScopedStyle>{styles}</ScopedStyle>

  {/* optional debug overlay — only when previewWidthInLiveView is true */}
  {Boolean(state.previewWidthInLiveView) && measuredWidth > 0 && (
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
  )}

  <div className="cmp-grid">
    {items.map((item) => (
      <div key={item.id} className="cmp-item-wrap">
        {/* render item */}
      </div>
    ))}
  </div>
</div>
```

---

## 5. editor.js — Layout tab settings

These are the core Layout tab controls. Place them in the **Layout** tab of your `<Tabs>` block.

```jsx
<Tab id="layout" title="Layout">
  <Section>
    <div className="cmp-settings-heading">Item Width</div>
    <SettingItem>
      <Label
        content="Min Item Width (px)"
        help="Items wrap to the next row when they would be narrower than this value. When Fixed Columns is enabled, column counts in the Advanced tab control the layout instead."
      />
      <NumberInput
        max={800}
        min={60}
        step={10}
        value={state.minItemWidth || 240}
        onChange={(minItemWidth) => setState({ ...state, minItemWidth })}
      />
    </SettingItem>
  </Section>

  <Section>
    <div className="cmp-settings-heading">Alignment</div>
    <SettingItem>
      <Label
        content="Alignment"
        help="Controls where items sit horizontally when they don't fill the full row. Has no effect in Fixed Columns mode."
      />
      <Dropdown
        options={[
          { value: "start", text: "Left" },
          { value: "center", text: "Center" },
          { value: "end", text: "Right" },
        ]}
        value={state.itemAlignment || "start"}
        onChange={(itemAlignment) => setState({ ...state, itemAlignment })}
      />
    </SettingItem>
  </Section>

  <Section>
    <div className="cmp-settings-heading">Gap</div>
    <SettingItem>
      <Label content="Gap (px)" />
      <NumberInput
        max={80}
        min={0}
        value={state.itemGap}
        onChange={(itemGap) => setState({ ...state, itemGap })}
      />
    </SettingItem>
  </Section>
</Tab>
```

---

## 6. editor.js — Advanced tab (Fixed Column Layout section)

Add a **Fixed Column Layout** section inside your `<Tab id="advanced">`. This is always present regardless of whether the component has other advanced settings.

Requires these CSS classes in the component's `ScopedStyle` block (replace `cmp-` with your prefix):

```css
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

```jsx
<Tab id="advanced" title="Advanced">
  <Section>
    <div className="cmp-settings-heading">Fixed Column Layout</div>
    <SettingItem>
      <Label
        content="Fixed Columns"
        help="By default, items wrap automatically based on the minimum item width. Enable this to lock an exact number of columns at each component width — useful when you need a specific layout at each screen size."
        style={{ paddingBottom: "12px" }}
      />
      <Checkbox
        label="Enable"
        value={Boolean(state.hasWidthBreakpoint)}
        onChange={(val) => setState({ ...state, hasWidthBreakpoint: val })}
      />
    </SettingItem>

    {state.hasWidthBreakpoint && (
      <>
        <SettingItem>
          <Label
            content="Breakpoint 1 (px)"
            help="When the component width drops to or below this value, the mid column count applies."
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
            help="When the component width drops to or below this value, the compact column count applies. Must be lower than Breakpoint 1."
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

        <div className="cmp-settings-subsection-heading">Columns</div>
        <div className="cmp-bp-grid">
          <SettingItem>
            <Label
              content={`\u2264 ${Number(state.widthBreakpoint2) || 480}px`}
              help={`Columns shown when the component width is at or below ${Number(state.widthBreakpoint2) || 480}px.`}
            />
            <NumberInput
              max={6}
              min={1}
              value={state.maxColumnsCompact}
              onChange={(val) => setState({ ...state, maxColumnsCompact: val })}
            />
          </SettingItem>
          <SettingItem>
            <Label
              content={`\u2264 ${Number(state.widthBreakpoint) || 768}px`}
              help={`Columns shown when the component width is at or below ${Number(state.widthBreakpoint) || 768}px.`}
            />
            <NumberInput
              max={6}
              min={1}
              value={state.maxColumnsMid}
              onChange={(val) => setState({ ...state, maxColumnsMid: val })}
            />
          </SettingItem>
          <SettingItem>
            <Label content="Initial" help="Columns shown at full width." />
            <NumberInput
              max={6}
              min={1}
              value={state.maxColumns}
              onChange={(val) => setState({ ...state, maxColumns: val })}
            />
          </SettingItem>
        </div>
      </>
    )}
  </Section>
</Tab>
```

---

## Rules

1. **Never use CSS `@media` queries** for column switching. All layout changes are driven by JS using `measuredWidth`.
2. **Clamp BP2** defensively in JS: `bp2 = Math.min(bp1 - 1, Math.max(60, bp2))`. Also show the inline validation error in the editor when `widthBreakpoint2 >= widthBreakpoint`.
3. **Only switch `display`** between `flex` and `grid`. Do not mix flex and grid properties on the same element.
4. **In auto-wrap mode**, compute `colWidth` so every item gets exactly its fair share of the measured width minus gaps. Do not set `flex-grow` on item wrappers.
5. **In fixed-columns mode**, item wrappers get `min-width: 0` only (no explicit width). `1fr` handles sizing.
6. **`containerRef` goes on the outermost wrapper**, not the grid `<div>`. The wrapper must be `width: 100%; position: relative`.
7. **`currentComponentWidth`** is written to state so the editor can read the live width if needed (e.g. for previewing which column breakpoint is active). Always guard against setting it when the value hasn't changed.
8. **The debug overlay** (`previewWidthInLiveView`) is a dev/preview aid. Gate it with `Boolean(state.previewWidthInLiveView) && measuredWidth > 0`. Never show it in production by default.
9. **Column max** — keep `max={6}` on column `NumberInput`s unless the component has a specific reason for more. The current component uses `max={4}`.
10. **Subsection heading CSS** — use the component's own prefix class (e.g. `cgc-settings-subsection-heading`) rather than a generic one. See the `settings-section-headings` skill for heading style rules.
