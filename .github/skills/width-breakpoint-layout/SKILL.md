---
name: width-breakpoint-layout
description: 'Add layout stacking based on the component's own measured width, without changing height behavior. Use when a component needs to switch from side-by-side to stacked layout at a configurable width threshold — different from breakpoint-height which changes RESIZABLE vs CONTENT_BASED height mode.'
---

# Width Breakpoint Layout

Use this skill when the component needs to change its **layout** (e.g. stack side-by-side elements vertically) based on the component's own measured width — without changing height behavior.

> This is different from the `breakpoint-height` skill, which changes the height mode between RESIZABLE and CONTENT_BASED. This pattern keeps height as-is and only drives layout changes.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## Goal

Measure the component's own rendered width using ResizeObserver. When the width falls at or below a user-configured breakpoint, apply a compact/stacked layout. Above the breakpoint, use the normal layout.

Do **not** add CSS `@media` queries. All layout switching must be driven by JS.

---

## common.js

Add these fields before `...state`:

```js
hasWidthBreakpoint: false,
widthBreakpoint: 768,
previewWidthInLiveView: false,
currentComponentWidth: 0,
```

For every number setting that needs a compact override, add the default value and its toggle before `...state`, then re-normalize both after `...state`:

```js
// Before ...state — defaults
headingFontSize: 54,
headingFontSizeCompact: 28,
hasHeadingFontSizeCompact: false,
paddingY: 56,
paddingYCompact: 32,
hasPaddingYCompact: false,
paddingX: 48,
paddingXCompact: 24,
hasPaddingXCompact: false,

// After ...state — re-normalization
headingFontSize: getNumberValue(state && state.headingFontSize, 54),
headingFontSizeCompact: getNumberValue(state && state.headingFontSizeCompact, 28),
paddingY: getNumberValue(state && state.paddingY, 56),
paddingYCompact: getNumberValue(state && state.paddingYCompact, 32),
paddingX: getNumberValue(state && state.paddingX, 48),
paddingXCompact: getNumberValue(state && state.paddingXCompact, 24),
widthBreakpoint: getNumberValue(state && state.widthBreakpoint, 768),
```

Boolean toggles (`hasXxxCompact`) do not need re-normalization.

---

## editor.js — `ResponsiveNumberSetting` component

Add this reusable component above `getControlValue`. It handles the number input, the dynamic hint, the override checkbox, and the compact input:

```jsx
const hintTextStyle = {
  fontSize: "11px",
  color: "#9ca3af",
  lineHeight: 1.4,
  marginTop: "4px",
};

const responsiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const responsiveCellStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const responsivePlaceholderStyle = {
  minHeight: "1px",
};

function ResponsiveNumberSetting({
  label,
  value,
  min,
  max,
  step,
  compactValue,
  hasCompact,
  onChangeValue,
  onChangeCompactValue,
  onChangeHasCompact,
  hasBreakpoint,
}) {
  if (!hasBreakpoint) {
    return (
      <SettingItem>
        <Label content={label} />
        <NumberInput
          value={value}
          min={min}
          max={max}
          step={step || 1}
          onChange={onChangeValue}
        />
      </SettingItem>
    );
  }

  return (
    <>
      <div style={responsiveCellStyle}>
        <SettingItem>
          <Label content={label} />
          <NumberInput
            value={value}
            min={min}
            max={max}
            step={step || 1}
            onChange={onChangeValue}
          />
        </SettingItem>
        {!hasCompact && (
          <div style={hintTextStyle}>
            Auto: <strong>{compactValue}px</strong> below breakpoint.
          </div>
        )}
        <SettingItem>
          <Checkbox
            label="Set compact size manually"
            value={Boolean(hasCompact)}
            onChange={onChangeHasCompact}
          />
        </SettingItem>
      </div>
      <div style={responsiveCellStyle}>
        {hasCompact ? (
          <SettingItem>
            <Label content={`${label} (compact)`} />
            <NumberInput
              value={compactValue}
              min={min}
              max={max}
              step={step || 1}
              onChange={onChangeCompactValue}
            />
          </SettingItem>
        ) : (
          <div style={responsivePlaceholderStyle} />
        )}
      </div>
    </>
  );
}
```

Layout rules for this pattern:

- Keep one parent 2-column grid. Each responsive numeric control should contribute exactly two sibling cells to that grid.
- Left cell: base input, short hint text, and override checkbox.
- Right cell: compact input only when manual override is enabled; otherwise render an empty placeholder to preserve the 2-column layout.
- Keep the hint short. Preferred wording: `Auto: 20px below breakpoint.`
- Use this same layout for responsive font size so typography controls behave like other responsive numeric controls.
- For standalone uses, wrap the control in `responsiveGridStyle` at the call site. For multiple responsive controls in one section, reuse the same parent 2-column grid rather than nesting another grid per control.

For font size, wrap as `ResponsiveFontSize`:

```jsx
function ResponsiveFontSize({
  value,
  min,
  max,
  step,
  compactValue,
  hasCompact,
  onChangeSize,
  onChangeCompactSize,
  onChangeHasCompact,
  hasBreakpoint,
}) {
  return (
    <ResponsiveNumberSetting
      label="Size"
      value={value}
      min={min}
      max={max}
      step={step}
      compactValue={compactValue}
      hasCompact={hasCompact}
      onChangeValue={onChangeSize}
      onChangeCompactValue={onChangeCompactSize}
      onChangeHasCompact={onChangeHasCompact}
      hasBreakpoint={hasBreakpoint}
    />
  );
}
```

#### Usage — font size

```jsx
<ResponsiveFontSize
  value={state.headingFontSize}
  min={12}
  max={120}
  compactValue={state.headingFontSizeCompact}
  hasCompact={state.hasHeadingFontSizeCompact}
  onChangeSize={(value) => updateStateField("headingFontSize", value)}
  onChangeCompactSize={(value) =>
    updateStateField("headingFontSizeCompact", value)
  }
  onChangeHasCompact={(value) =>
    updateStateField(
      "hasHeadingFontSizeCompact",
      Boolean(getControlValue(value)),
    )
  }
  hasBreakpoint={Boolean(state.hasWidthBreakpoint)}
/>
```

#### Usage — padding or any other number

```jsx
<ResponsiveNumberSetting
  label="Padding Top / Bottom"
  value={state.paddingY}
  min={0}
  max={240}
  step={4}
  compactValue={state.paddingYCompact}
  hasCompact={state.hasPaddingYCompact}
  onChangeValue={(value) => updateStateField("paddingY", value)}
  onChangeCompactValue={(value) => updateStateField("paddingYCompact", value)}
  onChangeHasCompact={(value) =>
    updateStateField("hasPaddingYCompact", Boolean(getControlValue(value)))
  }
  hasBreakpoint={Boolean(state.hasWidthBreakpoint)}
/>
```

#### Advanced tab — responsive width section

```jsx
<Section>
  <div className="ssc-settings-section-heading">responsive width</div>
  <SettingItem>
    <Checkbox
      label="Enable width breakpoint"
      value={Boolean(state.hasWidthBreakpoint)}
      onChange={(value) =>
        updateStateField("hasWidthBreakpoint", Boolean(getControlValue(value)))
      }
    />
  </SettingItem>
  {state.hasWidthBreakpoint && (
    <>
      <SettingItem>
        <Label
          content="Breakpoint Width"
          help="When the component width is at or below this value, the layout stacks and compact sizes apply."
        />
        <NumberInput
          value={state.widthBreakpoint}
          min={120}
          max={2000}
          step={1}
          onChange={(value) => updateStateField("widthBreakpoint", value)}
        />
      </SettingItem>
      <SettingItem>
        <Checkbox
          label="Preview current width in live view"
          value={Boolean(state.previewWidthInLiveView)}
          onChange={(value) =>
            updateStateField(
              "previewWidthInLiveView",
              Boolean(getControlValue(value)),
            )
          }
        />
      </SettingItem>
    </>
  )}
</Section>
```

Do **not** change `getSizeTypes` — height behavior stays the same **unless** the component also needs to remove the height drag handle below the breakpoint (e.g. a count-up number that should collapse to content height on mobile). In that case:

1. Update `getSizeTypes` in `editor.js` to return `CONTENT_BASED` when `isCompactLayout` is true (see the `breakpoint-height` skill for the exact pattern).
2. Add `platformHeightRef` and the imperative DOM-walking `useEffect` to `live.js` (see **`breakpoint-height` → live.js — .dot-component height override effect**).
3. Switch all container `height` CSS values to `auto` when compact (root, wrapper, and inner card containers).

> Do **not** use `ScopedStyle` to target `.dot-component`. `ScopedStyle` is scoped inside the component container and cannot reach the platform wrapper above it — the imperative DOM-walking effect is the only reliable approach.

---

## live.js

Add `containerRef` and `measuredWidth` after `useScaler()`:

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

Derive `isCompactLayout`:

```js
const breakpointWidth = Math.max(120, Number(state.widthBreakpoint) || 768);
const isCompactLayout =
  Boolean(state.hasWidthBreakpoint) &&
  measuredWidth > 0 &&
  measuredWidth <= breakpointWidth;
```

Attach `ref={containerRef}` to the outermost div returned by `Component`.

#### Resolving compact values

```js
// Font size
fontSize: `${s(isCompactLayout && state.hasHeadingFontSizeCompact ? Number(state.headingFontSizeCompact) || 28 : Number(state.headingFontSize) || 54)}px`

// Padding
paddingY: s(isCompactLayout && state.hasPaddingYCompact ? Number(state.paddingYCompact) || 32 : Number(state.paddingY) || 56),
paddingX: s(isCompactLayout && state.hasPaddingXCompact ? Number(state.paddingXCompact) || 24 : Number(state.paddingX) || 48),
```

Pattern: `isCompactLayout && state.hasXxxCompact ? compactValue : defaultValue`.

#### Layout stacking

```js
const flexDir = isCompactLayout
  ? "column"
  : section.imagePosition === "right"
    ? "row-reverse"
    : "row";
const isRow =
  !isCompactLayout &&
  (section.imagePosition === "left" || section.imagePosition === "right");
```

When stacked, center image and copy:

```jsx
// Image wrap
style={{ ...(isCompactLayout ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }}

// Copy block
style={isCompactLayout ? { alignItems: 'center', textAlign: 'center' } : {}}
```

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

- [ ] Four base fields added to `common.js` before `...state`
- [ ] Compact value pairs (`xyzCompact` + `hasXyzCompact`) added for each overridable setting
- [ ] All number fields re-normalized after `...state`
- [ ] `ResponsiveNumberSetting` and `ResponsiveFontSize` added above `getControlValue`
- [ ] All overridable settings use `ResponsiveFontSize` or `ResponsiveNumberSetting` with `hasBreakpoint={Boolean(state.hasWidthBreakpoint)}`
- [ ] Advanced tab has one "responsive width" section
- [ ] `getSizeTypes` is unchanged (unless height switching is also required — see note above)
- [ ] If height switching: `platformHeightRef` + DOM-walking `useEffect` present in `live.js`; all container heights set to `auto` when compact
- [ ] No CSS `@media` queries used for layout switching
- [ ] ResizeObserver effect added with proper cleanup
- [ ] `isCompactLayout` derived from `measuredWidth` and `state.widthBreakpoint`
- [ ] Compact values resolved with `isCompactLayout && state.hasXxxCompact ? compact : default` pattern
- [ ] `containerRef` attached to outermost div
- [ ] Measurement overlay shown only when `previewWidthInLiveView` is true
