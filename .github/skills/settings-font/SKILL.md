---
name: settings-font
description: "Standard typography settings block for Dot.vu editor.js — Font Family, Font Weight, Font Size, Line Height in a 2×2 grid under a Typography heading, followed by Text Alignment, then Color and Inactive Color (hover, etc.) in a 2×2 grid. Use whenever a component has a TextInput or textarea and needs font styling controls."
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
color: '#000000',
// Only add if the component has a secondary/inactive state (hover, unrevealed, etc.):
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
  {/* Color row — always show Color; add inactiveColor when the component has a secondary state */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
    <SettingItem>
      <Label content="Color" />
      <ColorPicker
        value={state.color}
        onChange={(color) => setState({ ...state, color })}
      />
    </SettingItem>
    {/* Uncomment when the component has an inactive/hover/unrevealed state */}
    {/*
    <SettingItem>
      <Label content="Inactive Color" help="Color when inactive, hovered, or unrevealed" />
      <ColorPicker
        value={state.inactiveColor}
        onChange={(inactiveColor) => setState({ ...state, inactiveColor })}
      />
    </SettingItem>
    */}
  </div>
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
color: ${state.color};
```

---

## Responsive font size with width breakpoint

If the component already implements the width-breakpoint pattern, font size can use a responsive editor format instead of a single static input.

- Keep the overall layout on one parent 2-column grid. Do not nest a second 2-column grid inside the typography grid.
- Let each responsive font-size control contribute exactly two sibling cells to that grid.
- Keep the main font size input, hint text, and manual override checkbox grouped in the left cell.
- Keep the hint short and place it directly under the main input. Preferred copy: `Auto: 20px below breakpoint.`
- Show the compact font-size input in the right cell on the same row only when the manual override checkbox is enabled.
- When manual override is off, keep the right cell empty so the layout stays capped at 2 columns.
- Do not expose responsive font size controls unless the component already has `hasWidthBreakpoint` and `widthBreakpoint` support.
- Reuse the shared `ResponsiveNumberSetting` / `ResponsiveFontSize` pattern from the `width-breakpoint-layout` skill instead of creating a second responsive typography flow.

---

## Rules

- Always use `s()` from `useScaler` when outputting `fontSize` in the CSS template string in `live.js`.
- The 2×2 grid order is fixed: **Font Family → Font Weight → Font Size → Line Height**.
- Alignment always appears **below** the font grid, as a full-width row.
- Color pickers always appear **below** Alignment, in their own 2-column grid.
- The active color field is named `color` (state key) and labelled **"Color"** in the editor.
- Inactive Color occupies the second cell of the color grid. Its label and `help` text should describe the specific secondary state (hover, unrevealed, inactive, etc.).
- Do not add `Inactive Color` unless the component explicitly has a two-state color (e.g. hover, scroll reveal, inactive).
- When both colors are present, use `color` + `inactiveColor` as the state field names.
- Default `fontWeight` is `400` for body text components, `700` for heading-style components.
- The section heading `"Typography"` is always present when this block is used.
- When responsive font size is enabled through width-breakpoint support, keep the control on a single 2-column parent grid: left cell for base input, hint, and override; right cell for compact input or an empty placeholder.
