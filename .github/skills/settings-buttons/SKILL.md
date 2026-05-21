---
name: settings-buttons
description: "Pattern for Shape-based button styling in Dot.vu components — six shape presets (Square, Rounded, Pill, and Outlined variants), state fields, CSS variable derivation, and a getButtonShapeStyle() helper. Replaces border-radius, border-width, border-color, and line-height settings with a single Shape dropdown. Use when a component has configurable output buttons that need visual shape control."
---

# settings-buttons

Use this skill whenever a component has buttons that should let the user pick a visual shape preset, replacing manual border-radius, border-width, border-color, and line-height controls.

---

## Shape presets

| Value              | border-radius | border-width | Fill style |
| ------------------ | ------------- | ------------ | ---------- |
| `square`           | 0px           | 0            | Solid      |
| `rounded`          | 4px           | 0            | Solid      |
| `pill`             | 9999px        | 0            | Solid      |
| `outlined-square`  | 0px           | 2px          | Outlined   |
| `outlined-rounded` | 4px           | 2px          | Outlined   |
| `outlined-pill`    | 9999px        | 2px          | Outlined   |

**Rules:**

- Outlined shapes derive their border color from the button's **text color** (no separate border color picker needed).
- On hover, the border color follows the **hover text color**.
- Line height is hardcoded to `1.4` in CSS — not a per-button setting.

---

## common.js

Add one shape field per button. Use `'rounded'` as the default.

```js
primaryButtonShape: 'rounded',
// remove: primaryButtonLineHeight, primaryButtonBorderWidth,
//         primaryButtonBorderColor, primaryButtonBorderRadius*,
//         primaryButtonBorderRadiusLinked, primaryButtonHoverBorderColor
```

---

## editor.js

### Constant

```js
const BUTTON_SHAPE_OPTIONS = [
  { value: "square", text: "Square" },
  { value: "rounded", text: "Rounded" },
  { value: "pill", text: "Pill" },
  { value: "outlined-square", text: "Outlined Square" },
  { value: "outlined-rounded", text: "Outlined Rounded" },
  { value: "outlined-pill", text: "Outlined Pill" },
];
```

### Settings section (place Shape first, before typography)

```jsx
<SettingItem>
  <Label content="Shape" />
  <Dropdown
    options={BUTTON_SHAPE_OPTIONS}
    value={state.primaryButtonShape || 'rounded'}
    onChange={(primaryButtonShape) => setState({ ...state, primaryButtonShape })}
  />
</SettingItem>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
  {/* Font Family, Font Weight, Font Size */}
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
  {/* Background, Text color */}
</div>
<div className="quiz-settings-subsection-heading">Hover</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
  {/* Hover Background, Hover Text */}
</div>
```

**Do not add:** Line Height, Border Width, Border Color, Corner radius, Hover Border Color.

---

## live.js

### Helper function

Place after `getStyles()` and before any render functions.

```js
function getButtonShapeStyle(shape, s) {
  const isOutlined = shape && shape.startsWith("outlined");
  const radius =
    shape && shape.includes("pill")
      ? s(9999)
      : shape && shape.includes("rounded")
        ? s(4)
        : 0;
  return {
    radius: `${radius}px`,
    borderWidth: isOutlined ? `${s(2)}px` : "0px",
    isOutlined,
  };
}
```

### CSS template (in getStyles)

```css
.quiz-btn-primary {
  /* ... other properties ... */
  line-height: 1.4; /* hardcoded — not a CSS variable */
  border: var(--quiz-primary-btn-border-width) solid
    var(--quiz-primary-btn-border-color);
  border-radius: var(--quiz-primary-btn-radius);
}
.quiz-btn-primary:hover:not(:disabled) {
  background: var(--quiz-primary-btn-hover-bg);
  color: var(--quiz-primary-btn-hover-text);
  border-color: var(--quiz-primary-btn-hover-border);
}
```

### cssVars derivation

```js
// Compute once per button
const primaryShape = getButtonShapeStyle(
  state.primaryButtonShape || "rounded",
  s,
);

const cssVars = {
  // ...
  "--quiz-primary-btn-border-width": primaryShape.borderWidth,
  "--quiz-primary-btn-border-color": primaryShape.isOutlined
    ? state.primaryButtonTextColor || "#ffffff"
    : "transparent",
  "--quiz-primary-btn-radius": primaryShape.radius,
  "--quiz-primary-btn-hover-border": primaryShape.isOutlined
    ? state.primaryButtonHoverTextColor || "#ffffff"
    : "transparent",
  // Remove '--quiz-primary-btn-lh' — no longer needed
};
```

### Fallback pattern (when a second button mirrors the first)

When a component has an "Answer Button" that optionally uses its own style, apply the same pattern with a conditional:

```js
const answerShape = getButtonShapeStyle(
  state.answerButtonUseCustomStyle
    ? state.secondaryButtonShape || "rounded"
    : state.primaryButtonShape || "rounded",
  s,
);
const answerTextColor = state.answerButtonUseCustomStyle
  ? state.secondaryButtonTextColor || state.primaryColor
  : state.primaryButtonTextColor || "#ffffff";

// '--quiz-secondary-btn-border-color': answerShape.isOutlined ? answerTextColor : 'transparent'
```

---

## Common mistakes

- **Setting `border-radius` as four separate corner values** — shapes produce a single uniform radius. Drop the four-corner pattern.
- **Keeping a Hover Border Color picker** — it's unnecessary; hover border follows hover text color for outlined shapes.
- **Forgetting to remove `--quiz-*-btn-lh` from cssVars** — once line-height is hardcoded in CSS, delete the variable from the map to avoid confusion.
- **Deriving `isOutlined` from text** — always use `shape.startsWith('outlined')`, not string includes.
