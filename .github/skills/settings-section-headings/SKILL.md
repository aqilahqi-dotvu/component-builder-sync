---
name: settings-section-headings
description: "Rules and CSS for SectionHeading and SubSectionHeading in editor.js — uppercase with letter-spacing for section labels, capitalize without letter-spacing for sub-groups. Includes drawer-specific guidance when Drawer content is portaled outside ScopedStyle."
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
      onChange={(hasBackground) => setState({ ...state, hasBackground })}
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
  margin: 16px 0;
  padding-top: 16px;
  color: #000000;
  font-size: 14px;
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
    <FontSelector
      value={state.headingFont}
      onChange={(headingFont) => setState({ ...state, headingFont })}
    />
  </SettingItem>
  <SettingItem>
    <Label content="Size" />
    <NumberInput
      value={state.headingFontSize}
      min={10}
      max={72}
      step={1}
      onChange={(headingFontSize) => setState({ ...state, headingFontSize })}
    />
  </SettingItem>

  <div className="faq-settings-subsection-heading">Body</div>
  <SettingItem>
    <Label content="Font" />
    <FontSelector
      value={state.bodyFont}
      onChange={(bodyFont) => setState({ ...state, bodyFont })}
    />
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

| Element             | Class                             | `text-transform` | `letter-spacing` | When to use                                            |
| ------------------- | --------------------------------- | ---------------- | ---------------- | ------------------------------------------------------ |
| Section heading     | `xxx-settings-section-heading`    | `uppercase`      | `0.08em`         | First child of a `Section`, labels the whole group     |
| Sub-section heading | `xxx-settings-subsection-heading` | `capitalize`     | none             | Inside a long `Section` to split into named sub-groups |

---

## Injecting the stylesheet

The heading CSS lives in a `<style>` tag rendered inside the `Settings` component. **Do not place `<style>` inside `<Tabs>` as a sibling of `<Tab>` elements.** The `<Tabs>` component only processes `<Tab>` children and silently discards everything else, so the styles are never injected and the heading classes have no effect.

**Wrong — styles silently dropped:**

```jsx
function Settings({ state, setState }) {
  return (
    <Tabs defaultActiveTab="content">
      <style>{EDITOR_STYLES}</style> {/* ❌ ignored by Tabs */}
      <Tab id="content" title="Content">
        ...
      </Tab>
    </Tabs>
  );
}
```

**Correct — wrap in a fragment so `<style>` renders outside `<Tabs>`:**

```jsx
function Settings({ state, setState }) {
  return (
    <>
      <style>{EDITOR_STYLES}</style> {/* ✅ injected into the DOM */}
      <Tabs defaultActiveTab="content">
        <Tab id="content" title="Content">
          ...
        </Tab>
      </Tabs>
    </>
  );
}
```

---

## Drawers

When headings are used inside `Drawer` / `DrawerSection`, first verify whether the component library renders the drawer content **inside the same DOM subtree** as the editor panel or into a portal.

### If Drawer content stays inside the scoped tree

Use the same component-prefixed classes as normal sections:

```jsx
<DrawerSection>
  <div className="faq-settings-section-heading">Question details</div>
  <div className="faq-settings-subsection-heading">Copy</div>
  <SettingItem>
    <Label content="Question text" />
    <TextInput ... />
  </SettingItem>
</DrawerSection>
```

### If Drawer content is portaled outside `ScopedStyle`

Class-based styles defined in `ScopedStyle` may not apply to drawer content even though the class names are present. In that case, use small inline heading helpers for the drawer only.

**Recommended pattern:**

```jsx
const drawerSectionHeadingStyle = {
  margin: "0 0 12px 0",
  color: "#000000",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  lineHeight: 1.2,
  textTransform: "uppercase",
};

const drawerSubsectionHeadingStyle = {
  margin: "16px 0",
  paddingTop: "16px",
  color: "#000000",
  fontSize: "14px",
  letterSpacing: "0.02em",
  fontWeight: 700,
  lineHeight: 1.2,
  textTransform: "capitalize",
};

function DrawerSectionHeading({ children }) {
  return <div style={drawerSectionHeadingStyle}>{children}</div>;
}

function DrawerSubsectionHeading({ children }) {
  return <div style={drawerSubsectionHeadingStyle}>{children}</div>;
}
```

**Usage in a drawer:**

```jsx
<DrawerSection>
  <DrawerSectionHeading>Question details</DrawerSectionHeading>
  <DrawerSubsectionHeading>Copy</DrawerSubsectionHeading>
  <SettingItem>
    <Label content="Question text" />
    <TextInput ... />
  </SettingItem>
</DrawerSection>
```

### Drawer rules

- Treat each `DrawerSection` like a normal `Section`: one section heading maximum, first child.
- Use sub-section headings only when a single `DrawerSection` contains two or more distinct control groups.
- Prefer splitting large drawers into multiple `DrawerSection` blocks before adding many sub-section headings.
- If headings are visible in tabs but not in drawers, assume a portal/scoping issue before changing the copy or markup.
- Do not duplicate the same heading text in `Label` content immediately below it.

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

// ❌ Relying on ScopedStyle drawer classes without checking portal behavior
// If the Drawer is portaled, the class names may exist but the styles still will not apply.
```
