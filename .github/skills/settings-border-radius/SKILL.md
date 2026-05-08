---
name: settings-border-radius
description: "Rules and patterns for per-corner border-radius settings — linked/unlinked toggle, 2×2 grid for individual controls, migration from a legacy single-value field, and s()-scaled CSS output. Use when adding corner-radius controls to a component."
---

# Border Radius Settings — Usage Rule

## Rule

Border-radius follows a linked/unlinked pattern: a `Checkbox` toggles between a single "all corners" input and a 2×2 grid of individual per-corner inputs. Corner order matches the CSS shorthand: top-left, top-right, bottom-right, bottom-left.

- **Do** store four per-corner fields (`borderRadiusTL`, `borderRadiusTR`, `borderRadiusBR`, `borderRadiusBL`) and a `borderRadiusLinked` boolean in state.
- **Do** default `borderRadiusLinked` to `true`.
- **Do** write a migration block in `common.js` that reads any legacy single-value `borderRadius` field and fans it out to the four per-corner fields.
- **Do** use `s()` on every numeric value in the CSS template string in `live.js`.
- **Do** gate the 2×2 grid behind `borderRadiusLinked !== false` (not `=== true`) to handle `undefined` safely.
- **Do not** allow negative radius values — clamp `min` at `0`.
- **Do not** skip the `Number(...)` cast when reading state values in `live.js` — they may arrive as strings.

---

## Patterns

### State fields — common.js

Add a migration block before `return`, then include the fields in the returned object.

```js
// Migration: per-corner radius from legacy borderRadius field
const legacyRadius = getNumberValue(state && state.borderRadius, 12);
const defaultRadiusTL =
  state && state.borderRadiusTL != null
    ? getNumberValue(state.borderRadiusTL, legacyRadius)
    : legacyRadius;
const defaultRadiusTR =
  state && state.borderRadiusTR != null
    ? getNumberValue(state.borderRadiusTR, legacyRadius)
    : legacyRadius;
const defaultRadiusBR =
  state && state.borderRadiusBR != null
    ? getNumberValue(state.borderRadiusBR, legacyRadius)
    : legacyRadius;
const defaultRadiusBL =
  state && state.borderRadiusBL != null
    ? getNumberValue(state.borderRadiusBL, legacyRadius)
    : legacyRadius;
```

Return object fields (inside `return { ... }`):

```js
borderRadiusTL:     defaultRadiusTL,
borderRadiusTR:     defaultRadiusTR,
borderRadiusBR:     defaultRadiusBR,
borderRadiusBL:     defaultRadiusBL,
borderRadiusLinked: state && state.borderRadiusLinked != null ? Boolean(state.borderRadiusLinked) : true,
```

---

### Editor controls — editor.js

Place this block inside the relevant `Section` (typically **Style** or **Design** tab).

```jsx
<div className="cmp-settings-subsection-heading">Corner radius (px)</div>
<SettingItem>
  <Checkbox
    label="Same for all corners"
    value={state.borderRadiusLinked !== false}
    onChange={(v) => setState({ ...state, borderRadiusLinked: v })}
  />
</SettingItem>
{state.borderRadiusLinked !== false ? (
  <SettingItem>
    <Label content="All corners" />
    <NumberInput
      min={0}
      max={200}
      step={1}
      value={state.borderRadiusTL}
      onChange={(val) => {
        const n = Number(val)
        setState({ ...state, borderRadiusTL: n, borderRadiusTR: n, borderRadiusBR: n, borderRadiusBL: n })
      }}
    />
  </SettingItem>
) : (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', boxSizing: 'border-box' }}>
    <SettingItem>
      <Label content="Top left" />
      <NumberInput
        min={0}
        max={200}
        step={1}
        value={state.borderRadiusTL}
        onChange={(val) => setState({ ...state, borderRadiusTL: Number(val) })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Top right" />
      <NumberInput
        min={0}
        max={200}
        step={1}
        value={state.borderRadiusTR}
        onChange={(val) => setState({ ...state, borderRadiusTR: Number(val) })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Bottom right" />
      <NumberInput
        min={0}
        max={200}
        step={1}
        value={state.borderRadiusBR}
        onChange={(val) => setState({ ...state, borderRadiusBR: Number(val) })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Bottom left" />
      <NumberInput
        min={0}
        max={200}
        step={1}
        value={state.borderRadiusBL}
        onChange={(val) => setState({ ...state, borderRadiusBL: Number(val) })}
      />
    </SettingItem>
  </div>
)}
```

> **`InputField` wrapper** — If the component already defines a local `InputField` helper, use it instead of bare `NumberInput`. It auto-generates Min/Max hint text below the input. Replace `<NumberInput .../>` with `<InputField type="number" .../>`.

---

### Live rendering — live.js

Compute safe numeric values inside the component function:

```js
const borderRadiusTL = Number(state.borderRadiusTL) || 0;
const borderRadiusTR = Number(state.borderRadiusTR) || 0;
const borderRadiusBR = Number(state.borderRadiusBR) || 0;
const borderRadiusBL = Number(state.borderRadiusBL) || 0;
```

Apply in the CSS template string (always wrap with `s()`):

```js
const styles = `
  .my-element {
    border-radius: ${s(borderRadiusTL)}px ${s(borderRadiusTR)}px ${s(borderRadiusBR)}px ${s(borderRadiusBL)}px;
  }
`;
```

---

## Quick reference

| Situation                                           | Pattern                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| All corners equal                                   | `borderRadiusLinked: true` — single `NumberInput` writes all four fields simultaneously   |
| Independent corners                                 | `borderRadiusLinked: false` — 2×2 grid, each input updates one field                      |
| Guard against undefined `linkedFlag`                | Use `state.borderRadiusLinked !== false`, not `state.borderRadiusLinked === true`         |
| Legacy component with a single `borderRadius` field | Add migration block: read into `legacyRadius`, default all four per-corner fields from it |
| Pill / fully rounded shape                          | Keep `max={200}` or higher — do not clamp dynamically based on element dimensions         |
| CSS property order                                  | Always TL → TR → BR → BL to match the CSS `border-radius` shorthand                       |

---

## What not to do

```jsx
// ❌ Single radius field — no per-corner control
<NumberInput
  value={state.borderRadius}
  onChange={(borderRadius) => setState({ ...state, borderRadius })}
/>

// ❌ Linked check with === true — breaks when field is undefined
{state.borderRadiusLinked === true && <NumberInput ... />}

// ❌ String interpolated directly without Number() cast — may produce 'NaNpx'
border-radius: ${state.borderRadiusTL}px ${state.borderRadiusTR}px ...

// ❌ s() omitted — breaks scaling in the Dot.vu editor preview
border-radius: ${borderRadiusTL}px ${borderRadiusTR}px ...

// ❌ Wrong corner order — does not match CSS shorthand
border-radius: ${s(borderRadiusTL)}px ${s(borderRadiusBL)}px ${s(borderRadiusTR)}px ${s(borderRadiusBR)}px;
```
