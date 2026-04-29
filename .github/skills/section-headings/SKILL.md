---
name: section-headings
description: 'Rules and CSS for SectionHeading and SubSectionHeading in editor.js — uppercase with letter-spacing for section labels, capitalize without letter-spacing for sub-groups. Use when adding headings to editor tabs or sections.'
---

# Section Headings — Usage Rule

## SectionHeading

Use a component-prefixed heading class such as `<div className="faq-settings-section-heading">` to label a group of related controls at the top of a `Section`. Renders in uppercase with wide letter-spacing to visually separate groups.

**CSS (copy exactly):**

```css
.faq-settings-section-heading {
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
```

**Usage:**

```jsx
<Section>
  <div className="faq-settings-section-heading">Card</div>
  <SettingItem>
    <Checkbox
      value={state.hasBackground}
      onChange={hasBackground => setState({ ...state, hasBackground })}
      label="Show background"
    />
  </SettingItem>
</Section>
```

### Rules

- One heading per `Section` maximum. Place it as the first child.
- Keep the text short — 1–3 words. It is a label, not a sentence.
- Do not add a heading to a `Section` that contains only one control. The control's own `Label` is enough.

---

## SubSectionHeading

Use a component-prefixed class such as `<div className="faq-settings-subsection-heading">` when a single `Section` grows long enough to need internal grouping.

Same as the section heading style **except**:
- `text-transform: capitalize` instead of `uppercase`
- No `letter-spacing`

**CSS:**

```css
.faq-settings-subsection-heading {
  margin: 12px 0;
  padding-top: 12px;
  border-top: 1px solid #c0c0c0;
  color: #000000;
  font-size: 13px;
  letter-spacing: 0.02em;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}
```

**Usage — a long Styles section split into sub-groups:**

```jsx
<Section>
  <div className="faq-settings-section-heading">Typography</div>

  <div className="faq-settings-subsection-heading">Heading</div>
  <SettingItem>
    <Label content="Font" />
    <FontSelector value={state.headingFont} onChange={headingFont => setState({ ...state, headingFont })} />
  </SettingItem>
  <SettingItem>
    <Label content="Size" />
    <NumberInput value={state.headingFontSize} min={10} max={72} step={1} onChange={headingFontSize => setState({ ...state, headingFontSize })} />
  </SettingItem>

  <div className="faq-settings-subsection-heading">Body</div>
  <SettingItem>
    <Label content="Font" />
    <FontSelector value={state.bodyFont} onChange={bodyFont => setState({ ...state, bodyFont })} />
  </SettingItem>
</Section>
```

### Rules

- Only use a sub-section heading when a single `Section` contains **two or more distinct groups** of controls.
- If you find yourself adding sub-section headings to every section, split into separate `Section` elements instead.
- Keep the text short — 1–3 words, title-cased.
- **Do not repeat the sub-section heading name inside `Label` content.** When a sub-section heading already names the group (e.g. "Button"), use short labels like `"Label"`, `"Action"`, `"URL"` — not `"Button Label"`, `"Button Action"`.

---

## Quick reference

| Element | Class | `text-transform` | `letter-spacing` | When to use |
|---|---|---|---|---|
| Section heading | `xxx-settings-section-heading` | `uppercase` | `0.08em` | First child of a `Section`, labels the whole group |
| Sub-section heading | `xxx-settings-subsection-heading` | `capitalize` | none | Inside a long `Section` to split into named sub-groups |

---

## What not to do

```jsx
// ❌ Heading on a single-control section
<Section>
  <div className="faq-settings-section-heading">Background Color</div>
  <SettingItem>
    <Label content="Color" />
    <ColorPicker ... />
  </SettingItem>
</Section>

// ❌ Sub-section heading used when a new Section would be cleaner
// (avoid if you have only 1–2 controls per sub-group)
```
