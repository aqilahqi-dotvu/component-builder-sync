---
name: settings-input-field
description: "Reusable InputField wrapper for NumberInput and TextInput in editor.js — auto-generates Min/Max hint text, supports a custom hint override, keeps hint rendering consistent. Use when adding any NumberInput or TextInput that benefits from a hint line below the control."
---

# InputField — Reusable Input Wrapper

## Purpose

`InputField` is a thin editor-only wrapper that renders a `NumberInput` or `TextInput` with an optional hint line below it. Use it whenever an input benefits from a short note such as `Min: 0, Max: 100` or a custom instruction like `0–360°`.

Do not use `InputField` when no hint is needed and the control sits alone — import `NumberInput` or `TextInput` directly instead.

---

## Rules

- **`NumberInput`** — use when the value is always numeric. Pass `min`, `max`, and `step` to the wrapper; they are forwarded to the underlying control and used to auto-generate the hint.
- **`TextInput`** — use when the value is a string. Omit `min`, `max`, and `step`; pass a `hint` string directly if one is needed.
- **`hint` prop** — when supplied, it replaces the auto-generated text entirely. Pass `hint=""` to suppress the hint for a numeric input without removing the min/max forwarding.
- **`onChange`** for `NumberInput` receives the raw number directly (not a DOM event). Cast with `Number(val)` when writing back to state.
- **`onChange`** for `TextInput` receives a DOM event — read `e.currentTarget.value`.
- Do not call `s()` inside `InputField`. It is defined outside `Component` and has no access to the scaler.
- Define `InputField` once per file, above the `Settings` function. Do not duplicate it.

---

## Implementation

Add this helper above the `Settings` function in `editor.js`:

```jsx
function InputField({ type = 'number', value, onChange, min, max, step, hint, placeholder }) {
  // Auto-generate hint from min/max when no explicit hint is supplied
  const autoHint =
    type === 'number'
      ? [
          min !== undefined ? `Min: ${min}` : null,
          max !== undefined ? `Max: ${max}` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : ''

  const displayHint = hint !== undefined ? hint : autoHint

  return (
    <div style={{ boxSizing: 'border-box' }}>
      {type === 'number' ? (
        <NumberInput
          max={max}
          min={min}
          step={step}
          value={value}
          onChange={onChange}
        />
      ) : (
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
      {displayHint && (
        <span
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '11px',
            color: '#9ca3af',
            boxSizing: 'border-box',
          }}
        >
          {displayHint}
        </span>
      )}
    </div>
  )
}
```

---

## Usage patterns

### Numeric input — auto hint from min/max

```jsx
<SettingItem>
  <Label content="Corner radius (px)" />
  <InputField
    max={50}
    min={0}
    value={state.borderRadius}
    onChange={val => setState({ ...state, borderRadius: Number(val) })}
  />
</SettingItem>
```

Renders hint: `Min: 0, Max: 50`

### Numeric input — custom hint (overrides auto)

```jsx
<SettingItem>
  <Label content="Angle (°)" help="Direction of the gradient in degrees." />
  <InputField
    hint="0–360°"
    max={360}
    min={0}
    step={1}
    value={state.gradientAngle ?? 90}
    onChange={val => setState({ ...state, gradientAngle: Number(val) })}
  />
</SettingItem>
```

### Numeric input — suppress hint entirely

```jsx
<InputField
  hint=""
  max={100}
  min={0}
  value={state.opacity}
  onChange={val => setState({ ...state, opacity: Number(val) })}
/>
```

### Text input — static hint

```jsx
<SettingItem>
  <Label content="Prefix" help="Text shown before the number (e.g. '$')." />
  <InputField
    type="text"
    hint="Optional — leave blank to hide"
    placeholder="e.g. $"
    value={state.metricPrefix}
    onChange={e => setState({ ...state, metricPrefix: e.currentTarget.value })}
  />
</SettingItem>
```

### Text input — no hint needed (skip wrapper)

When a `TextInput` needs no hint, import and use it directly. Do not wrap it in `InputField` just for consistency.

```jsx
<SettingItem>
  <Label content="Metric Label" />
  <TextInput
    value={state.header}
    onChange={e => setState({ ...state, header: e.currentTarget.value })}
  />
</SettingItem>
```

---

## 2×2 grid layout for related inputs

Pair related numeric inputs side-by-side using a CSS grid wrapper:

```jsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    boxSizing: 'border-box',
  }}
>
  <SettingItem>
    <Label content="Size" help="Diameter of each shape in pixels." />
    <InputField
      max={40}
      min={4}
      value={state.dotSize}
      onChange={val => setState({ ...state, dotSize: Number(val) })}
    />
  </SettingItem>
  <SettingItem>
    <Label content="Gap" help="Spacing between shapes in pixels." />
    <InputField
      max={40}
      min={0}
      value={state.dotSpacing}
      onChange={val => setState({ ...state, dotSpacing: Number(val) })}
    />
  </SettingItem>
</div>
```

---

## Inline row layout (prefix / value / suffix)

Use a flex row when three narrow inputs belong together:

```jsx
<SettingItem>
  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
    <div style={{ flex: '0 0 72px' }}>
      <Label content="Prefix" help="Text shown before the number (e.g. '$')." />
      <InputField
        type="text"
        placeholder="e.g. $"
        value={state.metricPrefix}
        onChange={e => setState({ ...state, metricPrefix: e.currentTarget.value })}
      />
    </div>
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <Label content="Value" />
      <InputField
        value={state.metricValue}
        onChange={val => setState({ ...state, metricValue: Number(val) })}
      />
    </div>
    <div style={{ flex: '0 0 72px' }}>
      <Label content="Suffix" help="Text shown after the number (e.g. '%')." />
      <InputField
        type="text"
        placeholder="e.g. %"
        value={state.metricSuffix}
        onChange={e => setState({ ...state, metricSuffix: e.currentTarget.value })}
      />
    </div>
  </div>
</SettingItem>
```
