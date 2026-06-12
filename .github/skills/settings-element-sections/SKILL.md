---
name: settings-element-sections
description: Organize editor settings panels by UI element — GLOBAL first, then per-element sections with simplified labels that don't repeat the heading
---

# Settings Organized by Element

Use this pattern when organizing a large settings panel with many controls across different UI elements or features. It improves discoverability and reduces visual noise by grouping related settings and simplifying label language.

## When to use

- Settings panel has **8 or more controls** split across multiple element types (title, description, buttons, cards, etc.)
- You want users to quickly find all styling options for a specific part of the component
- Typography and colors are grouped by element rather than by control type
- You're organizing a **Style tab** or similar settings section

Do **not** use this pattern for:

- Small settings panels (fewer than 5 controls) — use simple `<Section>` blocks instead
- Content tabs where settings don't map to visual elements (use content-based grouping instead)
- Control type grouping (all "colors together" across elements) — use this pattern instead

## Pattern overview

**Section order:**

1. **GLOBAL** — settings that apply to the entire component (e.g., background color)
2. **Element sections** — one per logical UI part (Title, Description, Wheel, Card, Button, etc.)
3. **Optional sections** — Animation, Advanced, etc. (if needed)

**Within each element section:**

- Group all related controls together: typography (Font, Font Size, Weight), then colors
- Keep similar controls adjacent (Icon Color, Active Icon Color stay together)
- List controls in a logical reading order (font basics before colors)

## Label strategy

**Remove element-name prefixes** when the section heading provides that context:

| Section         | BAD                         | GOOD               |
| --------------- | --------------------------- | ------------------ |
| **title**       | "Title Font", "Title Color" | "Font", "Color"    |
| **description** | "Description Font Size"     | "Font Size"        |
| **button**      | "Button Background Color"   | "Background Color" |

**Keep context-dependent clarifiers** that distinguish between similar controls:

| Section                  | Control                 | Label                                | Why                                                    |
| ------------------------ | ----------------------- | ------------------------------------ | ------------------------------------------------------ |
| **wheel**                | Slice color (inactive)  | "Inactive Slice Color"               | Clarifies this is _not_ the active slice color         |
| **wheel**                | Icon colors             | "Icon Color", "Active Icon Color"    | "Icon" and "Active" both add meaning — don't remove    |
| **social media buttons** | Icon colors             | "Icon Color", "Active Icon Color"    | Kept in buttons section because icons matter here too  |
| **border**               | Multiple color controls | "Wheel Border Color", "Border Color" | "Wheel" clarifies this is the wheel, not button border |

**Help text carries specificity** — don't repeat context in labels:

✅ **DO** —

```jsx
<Label
  content="Font"
  help="Also applies to center button when Display Mode is Button Only."
/>
```

❌ **DON'T** —

```jsx
<Label content="Button Font (Also Center)" />
```

## Section naming conventions

- **Lowercase**, one or two words per section
- **Singular form** unless it's a logical pair (not "Buttons", just "Button")
- **Element names first** ("Title", "Wheel", "Card") — not feature names like "Styling"
- **Match the UI**: if the component has a "wheel" in the design, call the section "wheel"

### Typical sections for a styled component

| Section                                    | Used for                                                         |
| ------------------------------------------ | ---------------------------------------------------------------- |
| **global**                                 | Background color (truly global/shared)                           |
| **title**                                  | Heading typography and colors                                    |
| **description**                            | Subtitle/body typography and colors                              |
| **wheel** / **card** / **item**            | Visual element styling (borders, colors, icons)                  |
| **social media buttons** / **cta buttons** | Button typography, shape, colors                                 |
| **border**                                 | Borders that belong to multiple elements or the container        |
| **shadow**                                 | Drop shadows, glows                                              |
| **animation**                              | Transitions, entrance effects (separate tab)                     |
| **advanced**                               | Responsive, experimental, or rarely-used settings (separate tab) |

## Code example

From the Social Media QR component:

```jsx
function StyleSettings({ state, setState }) {
  return (
    <>
      <Section>
        <SectionHeading content="global" />
        <SettingItem>
          <Label content="Background Color" />
          <ColorPicker
            value={state.backgroundColor}
            onChange={(backgroundColor) =>
              setState({ ...state, backgroundColor })
            }
          />
        </SettingItem>
      </Section>

      <Section>
        <SectionHeading content="title" />
        <SettingItem>
          <Label content="Font" />
          <FontSelector
            value={state.titleFont}
            onChange={(titleFont) => setState({ ...state, titleFont })}
          />
        </SettingItem>
        <SettingItem>
          <Label content="Font Size" />
          <NumberInput max={48} min={12} step={1} value={state.titleFontSize} />
        </SettingItem>
        <SettingItem>
          <Label content="Font Weight" />
          <Dropdown
            options={FONT_WEIGHT_OPTIONS}
            value={state.titleFontWeight}
          />
        </SettingItem>
        <SettingItem>
          <Label content="Color" />
          <ColorPicker value={state.titleColor} />
        </SettingItem>
      </Section>

      <Section>
        <SectionHeading content="wheel" />
        {/* All wheel-related colors and borders */}
        <SettingItem>
          <Label content="Wheel Border Width" help="Set to 0 to disable." />
          <NumberInput />
        </SettingItem>
        <SettingItem>
          <Label content="Wheel Border Color" />
          <ColorPicker />
        </SettingItem>
        <SettingItem>
          <Label content="Inactive Slice Color" />
          <ColorPicker />
        </SettingItem>
        <SettingItem>
          <Label content="Active Slice + Center Color" help="..." />
          <ColorPicker />
        </SettingItem>
        {/* Icon colors kept together for visual hierarchy */}
        <SettingItem>
          <Label content="Icon Color" />
          <ColorPicker />
        </SettingItem>
        <SettingItem>
          <Label content="Active Icon Color" />
          <ColorPicker />
        </SettingItem>
      </Section>

      <Section>
        <SectionHeading content="social media buttons" />
        <SettingItem>
          <Label content="Font" help="Also applies to center button..." />
          <FontSelector />
        </SettingItem>
        <SettingItem>
          <Label content="Font Size" />
          <NumberInput />
        </SettingItem>
        <SettingItem>
          <Label content="Font Weight" />
          <Dropdown />
        </SettingItem>
        <SettingItem>
          <Label content="Shape" help="Predefined corner styles..." />
          <Dropdown options={BUTTON_SHAPE_OPTIONS} />
        </SettingItem>
        <SettingItem>
          <Label content="Background Color" />
          <ColorPicker />
        </SettingItem>
        <SettingItem>
          <Label content="Text Color" />
          <ColorPicker />
        </SettingItem>
      </Section>
    </>
  );
}
```

## Best practices

1. **Group typography together** — Font, Font Size, Font Weight in sequence. Don't scatter them.

2. **Put colors last in each section** — users mentally group "how it looks" (shape/size) before "what color it is".

3. **Use `help` for context** — when a setting applies elsewhere (e.g., "Also applies to center button"), use the help prop instead of a verbose label.

4. **Avoid generic names** — "Text Color" is better than "Color" only when the section heading doesn't already imply text (e.g., "colors" section without element context).

5. **Test discoverability** — can a user find all controls for one element without scrolling through unrelated sections? If not, reconsider your grouping.

6. **Consistent order across similar sections** — if your Title section orders controls as Font → Size → Weight → Color, do the same for Description and Button sections.

7. **Move rarely-used settings to Advanced** — if a section is growing past 8–10 controls, consider moving settings like "border-radius per-corner" to an Advanced tab to keep the main Style tab scannable.

## Migration from flat settings

If you're refactoring an existing flat settings panel:

1. Identify all UI elements in the component
2. List which controls belong to each element
3. Group by element in a new `<Section>` per element
4. Simplify labels by removing element-name prefixes
5. Test that the new organization feels natural — controls should flow left to right, top to bottom

## See also

- **settings-section-headings** — styling and CSS for section heading blocks
- **settings-font** — standard typography layout (Font, Size, Weight, Alignment, Color)
- **responsive-grid** — when element sections themselves need to be responsive
