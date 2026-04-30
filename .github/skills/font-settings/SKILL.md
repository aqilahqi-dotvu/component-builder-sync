---
name: font-settings
description: "Standard typography settings block for Dot.vu editor.js — Font Family, Font Weight, Font Size, Line Height in a 2×2 grid under a Typography heading, followed by Text Alignment and Color pickers. Use whenever a component has a TextInput or textarea and needs font styling controls."
---

# Font Settings Skill

Use this skill whenever a component has text content that should be styled by the user. Apply it to the Style tab in `editor.js`.

---

## State fields (add to `common.js`)

```js
font: 'Inter, sans-serif',
fontSize: 16,
fontWeight: 400,
lineHeight: 1.5,
textAlign: 'left',
textColor: '#000000',
// Only add if the component has a secondary/inactive text state:
// inactiveColor: '#e0e0e0',
```

---

## Required imports (in `editor.js`)

```js
import {
  NumberInput,
  FontSelector,
  ColorPicker,
  Dropdown,
  Section,
  SettingItem,
  Label,
} from "@ui";
```

---

## Editor markup

Place this block as a `Section` inside the **Style** `Tab`. If the tab already has other sections, add this as its own `Section`.

```jsx
<Section>
  <div
    style={{
      margin: "0 0 12px 0",
      color: "#000000",
      fontSize: "13px",
      fontWeight: 700,
      letterSpacing: "0.08em",
      lineHeight: 1.2,
      textTransform: "uppercase",
    }}
  >
    Typography
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
    <SettingItem>
      <Label content="Font Family" />
      <FontSelector
        value={state.font}
        onChange={(font) => setState({ ...state, font })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Font Weight" />
      <Dropdown
        options={[
          { value: 100, text: "Thin (100)" },
          { value: 200, text: "Extra Light (200)" },
          { value: 300, text: "Light (300)" },
          { value: 400, text: "Regular (400)" },
          { value: 500, text: "Medium (500)" },
          { value: 600, text: "Semi Bold (600)" },
          { value: 700, text: "Bold (700)" },
          { value: 800, text: "Extra Bold (800)" },
          { value: 900, text: "Black (900)" },
        ]}
        value={state.fontWeight}
        onChange={(value) => setState({ ...state, fontWeight: value })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Font Size (px)" />
      <NumberInput
        max={200}
        min={12}
        step={1}
        value={state.fontSize}
        onChange={(value) => setState({ ...state, fontSize: value })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Line Height" />
      <NumberInput
        max={3}
        min={0.5}
        step={0.05}
        value={state.lineHeight}
        onChange={(value) => setState({ ...state, lineHeight: value })}
      />
    </SettingItem>
  </div>
  <SettingItem>
    <Label content="Alignment" />
    <Dropdown
      options={[
        { value: "left", text: "Left" },
        { value: "center", text: "Center" },
        { value: "right", text: "Right" },
      ]}
      value={state.textAlign}
      onChange={(value) => setState({ ...state, textAlign: value })}
    />
  </SettingItem>
  <SettingItem>
    <Label content="Text Color" />
    <ColorPicker
      value={state.textColor}
      onChange={(color) => setState({ ...state, textColor: color })}
    />
  </SettingItem>
  {/* Add below if the component has an inactive/unrevealed text state */}
  {/*
  <SettingItem>
    <Label content="Inactive Color" help="Color of the text before it is revealed" />
    <ColorPicker
      value={state.inactiveColor}
      onChange={color => setState({ ...state, inactiveColor: color })}
    />
  </SettingItem>
  */}
</Section>
```

---

## `live.js` CSS usage

```js
font-family: ${state.font};
font-size: ${s(state.fontSize)}px;
font-weight: ${state.fontWeight};
line-height: ${state.lineHeight};
text-align: ${state.textAlign};
color: ${state.textColor};
```

---

## Rules

- Always use `s()` from `useScaler` when outputting `fontSize` in the CSS template string in `live.js`.
- The 2×2 grid order is fixed: **Font Family → Font Weight → Font Size → Line Height**.
- Alignment and Color pickers always appear **below** the grid, never inside it.
- If a component has both an active and inactive text color (e.g. scroll reveal), replace the single `textColor` picker with `activeColor` + `inactiveColor` pickers, in that order.
- Do not add `Inactive Color` unless the component explicitly has a two-state text color.
- Default `fontWeight` is `400` for body text components, `700` for heading-style components.
- The section heading `"Typography"` is always present when this block is used.
