---
name: shadow
description: 'Rules and patterns for implementing shadow settings across common.js, editor.js, and live.js — hasShadow gating, resolveShadowColor helper, rgba defaults, clamped numeric inputs, hover-only shadow, never interpolate hex directly into box-shadow. Use when adding shadow controls to a component.'
---

# Shadow — Usage Rule

## Rule

Shadow settings follow a two-level structure: a toggle to enable/disable the shadow, and conditional controls that appear only when the shadow is on.

- **Do** gate all shadow detail controls behind a `hasShadow` conditional.
- **Do** use `rgba(...)` as the default `shadowColor` in `common.js`.
- **Do** clamp numeric inputs with safe `min`/`max` bounds: offset ±100, blur 0–120, spread ±50.
- **Do** compute `boxShadow` in `live.js` using the `resolveShadowColor` helper and the `s()` scaler.
- **Do not** wire `shadowColor` directly into a CSS string without passing it through `resolveShadowColor`. Hex strings are not valid in `box-shadow`.
- **Do not** show shadow detail controls when `hasShadow` is `false`.
- **Do not** add a separate opacity slider. Opacity is encoded inside `shadowColor` as the alpha channel.

---

## Patterns

### State fields — common.js

```js
hasShadow: true,
shadowOnHover: false,
shadowColor: 'rgba(15, 23, 42, 0.16)',
shadowOffsetX: 0,
shadowOffsetY: 12,
shadowBlur: 32,
shadowSpread: 0,
```

### Editor controls — editor.js

```jsx
<Section>
  <div className="cmp-settings-section-heading">Shadow</div>
  <SettingItem>
    <Checkbox
      value={state.hasShadow}
      onChange={hasShadow => setState({ ...state, hasShadow })}
      label="Show shadow"
    />
  </SettingItem>
  {state.hasShadow && (
    <>
      <SettingItem>
        <Checkbox
          value={state.shadowOnHover}
          onChange={shadowOnHover => setState({ ...state, shadowOnHover })}
          label="Show on hover only"
        />
      </SettingItem>
      <SettingItem>
        <Label content="Color" />
        <ColorPicker value={state.shadowColor} onChange={shadowColor => setState({ ...state, shadowColor })} />
      </SettingItem>
      <SettingItem>
        <Label content="Horizontal Offset" />
        <NumberInput value={state.shadowOffsetX} min={-100} max={100} step={1} onChange={shadowOffsetX => setState({ ...state, shadowOffsetX })} />
      </SettingItem>
      <SettingItem>
        <Label content="Vertical Offset" />
        <NumberInput value={state.shadowOffsetY} min={-100} max={100} step={1} onChange={shadowOffsetY => setState({ ...state, shadowOffsetY })} />
      </SettingItem>
      <SettingItem>
        <Label content="Blur" />
        <NumberInput value={state.shadowBlur} min={0} max={120} step={1} onChange={shadowBlur => setState({ ...state, shadowBlur })} />
      </SettingItem>
      <SettingItem>
        <Label content="Spread" />
        <NumberInput value={state.shadowSpread} min={-50} max={50} step={1} onChange={shadowSpread => setState({ ...state, shadowSpread })} />
      </SettingItem>
    </>
  )}
</Section>
```

### Live rendering — live.js

Place the `resolveShadowColor` helper at module scope (outside the component function):

```js
function resolveShadowColor(color, opacity) {
  const normalizedColor = String(color || '').trim()
  if (!normalizedColor) return 'rgba(0, 0, 0, 0.18)'
  if (!normalizedColor.startsWith('#')) return normalizedColor
  const normalizedHex = normalizedColor.replace('#', '')
  if (![3, 6].includes(normalizedHex.length)) return `rgba(0, 0, 0, ${opacity})`
  const expandedHex = normalizedHex.length === 3
    ? normalizedHex.split('').map(value => `${value}${value}`).join('')
    : normalizedHex
  const red = parseInt(expandedHex.slice(0, 2), 16)
  const green = parseInt(expandedHex.slice(2, 4), 16)
  const blue = parseInt(expandedHex.slice(4, 6), 16)
  if ([red, green, blue].some(value => Number.isNaN(value))) return `rgba(0, 0, 0, ${opacity})`
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}
```

Compute the shadow values inside the component:

```js
const shadowOffsetX = Number(state.shadowOffsetX) || 0
const shadowOffsetY = Number(state.shadowOffsetY) || 0
const shadowBlur = Math.max(0, Number(state.shadowBlur) || 0)
const shadowSpread = Number(state.shadowSpread) || 0
const legacyShadowOpacity = Math.min(1, Math.max(0, Number(state.shadowOpacity) || 0.18))

const boxShadow = state.hasShadow
  ? `${s(shadowOffsetX)}px ${s(shadowOffsetY)}px ${s(shadowBlur)}px ${s(shadowSpread)}px ${resolveShadowColor(state.shadowColor, legacyShadowOpacity)}`
  : 'none'

const restingBoxShadow = state.hasShadow && !state.shadowOnHover ? boxShadow : 'none'
const hoverBoxShadow = state.hasShadow && state.shadowOnHover ? boxShadow : restingBoxShadow
```

Apply in the CSS template:

```js
const styles = `
  .my-element {
    box-shadow: ${restingBoxShadow};
    transition: box-shadow 0.2s ease;
  }
  .my-element:hover {
    box-shadow: ${hoverBoxShadow};
  }
`
```

---

## Quick reference

| Situation | Pattern |
|---|---|
| Simple always-on shadow | `hasShadow` toggle + detail controls, `shadowOnHover: false` default |
| Shadow appears only on hover | `shadowOnHover: true`; use `restingBoxShadow: 'none'`, `hoverBoxShadow: boxShadow` |
| Shadow is off | `hasShadow: false`; all detail controls hidden; CSS receives `'none'` |
| `shadowColor` is hex | Pass through `resolveShadowColor` — never interpolate hex directly into `box-shadow` |

---

## What not to do

```jsx
// ❌ Detail controls shown regardless of hasShadow toggle
<SettingItem>
  <ColorPicker value={state.shadowColor} onChange={...} />
</SettingItem>

// ❌ Hex interpolated directly — rgba is required
box-shadow: 0px 12px 32px 0px ${state.shadowColor}

// ❌ Separate opacity slider — encode it in the rgba value instead
<NumberInput value={state.shadowOpacity} ... />
```
