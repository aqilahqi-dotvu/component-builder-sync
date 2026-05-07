---
name: settings-grouping
description: "Rules and patterns for creating consistent setting groups in editor.js — predictable group order (Content, Layout, Design, Behavior, Advanced), clear reusable group names, direct primary actions, and AI/Preview behavior checks for scroll or animation settings. Use when creating or refactoring component settings layout."
---

# Settings Grouping — Usage Rule

## Rule

Group settings into clear, reusable sections so users can quickly find controls across components.

- **Do** use predictable top-level groups in this order when relevant: **Content**, **Layout**, **Design**, **Behavior**, **Advanced**.
- **Do** keep group names short and reusable (1-3 words).
- **Do** place the highest-frequency and primary actions near the top of the relevant group.
- **Do** expose the primary action directly when possible (for example, image replacement from preview), instead of hiding it behind overflow menus.
- **Do** keep component-specific controls flexible, but place them under the closest standard group.
- **Do not** invent new group names when an existing common name fits.
- **Do not** scatter related controls across multiple tabs or distant sections.

---

## Recommended group order

Use only groups that are needed; skip empty groups.

1. **Content**
   : Text, media selection, item lists, labels, and primary content actions.

2. **Layout**
   : Spacing, alignment, sizing, stacking, placement, and container behavior.

3. **Design**
   : Typography, colors, backgrounds, borders, shadows, and visual polish.

4. **Behavior**
   : Interactions, states, triggers, scroll logic, autoplay, reveal modes.

5. **Advanced**
   : Expert controls, debug toggles, fine-tuning, and less-used overrides.

---

## Primary action visibility

When a setting has one obvious core action, expose it directly in the main control surface.

- For image-driven settings, prioritize a direct replace/update path from preview when supported.
- Keep menu-only flows as secondary options, not the default path for common edits.
- If optional metadata exists (for example overlay text per image), keep it visible but secondary to the primary media action.

---

## Scroll and animation behavior checks

When a component uses scroll-driven or animation-driven behavior, verify grouping and UX against runtime differences.

- Add Behavior controls that clearly explain when logic runs in AI mode vs Preview mode.
- Include help text for settings that may appear inconsistent between AI mode and Preview mode.
- Add layout safeguards for Preview mode when extra container space can appear (for example container height, spacing, or fit-to-content options).
- If background color support is relevant to readability during animation/scroll, place it in **Design** under a clear label.

---

## Accessibility and preview quality

- Keep labels explicit and scannable; avoid vague labels like "Options" or "Misc".
- Use consistent naming so keyboard/screen-reader users can predict control locations across components.
- Ensure controls that affect readability (text/background contrast, overlay text visibility) are easy to discover.
- Prefer stable preview behavior and document known AI-mode vs Preview-mode differences in `help` text where applicable.

---

## Pattern example

```jsx
<Tab id="content" title="Content">
  <Section>
    <div className="cmp-settings-section-heading">Content</div>
    {/* text, media, primary content actions */}
  </Section>

  <Section>
    <div className="cmp-settings-section-heading">Layout</div>
    {/* spacing, sizing, alignment */}
  </Section>
</Tab>

<Tab id="style" title="Style">
  <Section>
    <div className="cmp-settings-section-heading">Design</div>
    {/* colors, typography, background, border */}
  </Section>
</Tab>

<Tab id="behavior" title="Behavior">
  <Section>
    <div className="cmp-settings-section-heading">Behavior</div>
    {/* interactions, scroll/animation rules, mode notes */}
  </Section>

  <Section>
    <div className="cmp-settings-section-heading">Advanced</div>
    {/* expert-only controls */}
  </Section>
</Tab>
```

---

## Quick reference

| Goal                                  | Preferred approach                                                         |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Consistent grouping across components | Reuse Content, Layout, Design, Behavior, Advanced                          |
| Faster common edits                   | Expose primary action directly, avoid menu-first workflows                 |
| Keep feature flexibility              | Add component-specific controls inside the nearest standard group          |
| Scroll/animation reliability          | Document AI vs Preview behavior and include layout safeguards              |
| Better readability and accessibility  | Keep labels clear, predictable, and contrast-related controls easy to find |

---

## What not to do

```jsx
// ❌ Primary action hidden inside overflow menu
// (requires opening three-dot menu for the most common edit)

// ❌ Mixed grouping: spacing in Content, colors in Behavior, animation in Style
// (hard to scan and inconsistent across components)

// ❌ Generic section names that do not communicate intent
<div className="cmp-settings-section-heading">Other</div>

// ❌ Scroll reveal setting without mode context or preview caveats
<Label content="Reveal Mode" />
```
