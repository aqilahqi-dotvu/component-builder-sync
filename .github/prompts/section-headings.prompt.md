---
agent: dotvu-component-builder
description: Rules and patterns for section headings and sub-section headings in editor.js
---

# Section Headings — Usage Rule

## SectionHeading

Use a `<div className="settings-section-heading">` to label a group of related controls at the top of a `Section`. It renders in uppercase with wide letter-spacing to visually separate groups.

**CSS (copy exactly as written in the boilerplate):**

```css
.settings-section-heading {
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
```

**Usage:**

```jsx
<Section>
  <div className="settings-section-heading">Card</div>
  <SettingItem>
    <Checkbox
      value={state.hasBackground}
      onChange={hasBackground => setState({ ...state, hasBackground })}
      label="Show background"
    />
  </SettingItem>
  ...
</Section>
```

### Rules

- One heading per `Section` maximum. Place it as the first child.
- Keep the text short — 1–3 words. It is a label, not a sentence.
- Do not add a heading to a `Section` that contains only one control. The control's own `Label` is enough.

---

## SubSectionHeading

Use a `<div className="settings-subsection-heading">` when a single `Section` grows long enough that it needs internal grouping. This keeps related controls visually clustered without splitting them into separate `Section` elements.

The style is identical to `settings-section-heading` **except**:
- `text-transform: capitalize` instead of `uppercase`
- No `letter-spacing`

**CSS:**

```css
.settings-subsection-heading {
  margin: 12px 0;
  padding-top: 12px;
  border-top: 1px solid #c0c0c0;
  color: #000000;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}
```

**Usage — a long Styles section split into sub-groups:**

```jsx
<Section>
  <div className="settings-section-heading">Typography</div>

  <div className="settings-subsection-heading">Heading</div>
  <SettingItem>
    <Label content="Font" />
    <FontSelector
      value={state.headingFont}
      onChange={headingFont => setState({ ...state, headingFont })}
    />
  </SettingItem>
  <SettingItem>
    <Label content="Size" />
    <NumberInput
      value={state.headingFontSize}
      min={10} max={72} step={1}
      onChange={headingFontSize => setState({ ...state, headingFontSize })}
    />
  </SettingItem>

  <div className="settings-subsection-heading">Body</div>
  <SettingItem>
    <Label content="Font" />
    <FontSelector
      value={state.bodyFont}
      onChange={bodyFont => setState({ ...state, bodyFont })}
    />
  </SettingItem>
  <SettingItem>
    <Label content="Size" />
    <NumberInput
      value={state.bodyFontSize}
      min={10} max={48} step={1}
      onChange={bodyFontSize => setState({ ...state, bodyFontSize })}
    />
  </SettingItem>
</Section>
```

### Rules

- Only use a sub-section heading when a single `Section` contains **two or more distinct groups** of controls.
- If you find yourself adding sub-section headings to every section, split into separate `Section` elements instead.
- Keep the text short — 1–3 words, title-cased.
- **Do not repeat the sub-section heading name inside `Label` content.** When a sub-section heading already names the group (e.g. "Button"), use short labels like `"Label"`, `"Action"`, `"URL"` — not `"Button Label"`, `"Button Action"`, `"Button URL"`.

---

## Quick reference

| Element | Class | `text-transform` | `letter-spacing` | When to use |
|---|---|---|---|---|
| Section heading | `settings-section-heading` | `uppercase` | `0.08em` | First child of a `Section`, labels the whole group |
| Sub-section heading | `settings-subsection-heading` | `capitalize` | none | Inside a long `Section` to split into named sub-groups |

---

## What not to do

```jsx
// ❌ Heading on a single-control section
<Section>
  <div className="settings-section-heading">Background Color</div>
  <SettingItem>
    <Label content="Color" />
    <ColorPicker ... />
  </SettingItem>
</Section>

// ❌ Sub-section heading used when a new Section would be cleaner
// (avoid if you have only 1–2 controls per sub-group)

// ❌ Using uppercase CSS on a subsection heading
.settings-subsection-heading { text-transform: uppercase; } // wrong
```
