---
name: svgpicker
description: 'Normalize SvgPicker icons so selected SVGs always support dynamic color via currentColor and scale with wrapper size. Covers normalization rules, live CSS overrides for fill/stroke, and viewBox preservation. Use when adding an icon picker to a component.'
---

# SVG Picker Normalization

Use this skill when a Dot.vu component uses `SvgPicker` and the selected icons must always respond to runtime color and size styling.

Read first: the three runtime files and `templates/boilerplate.md` for working examples.

---

## Goal

When storing or rendering SVG chosen through `SvgPicker`, make sure the icon can always:

- Inherit color from CSS via `currentColor`
- Scale with the component's configured icon size
- Keep a valid `viewBox` so resizing does not distort the icon

---

## Required behavior

- Treat `SvgPicker` output as editable SVG markup, not as a fixed-size asset.
- Normalize selected SVG strings before saving them into state when practical.
- Preserve a valid root `<svg ... viewBox="...">`.
- Do not rely on fixed root `width` and `height` attributes for sizing.
- Render icons inside a wrapper that controls icon size.
- Apply icon color through `color` on the wrapper or icon container.
- Ensure inner shapes use `currentColor` for visual color whenever possible.

---

## Normalization rules

1. Keep or create a valid `viewBox` on the root `<svg>`.
2. Remove fixed root `width` and `height` attributes when they would block responsive sizing.
3. Replace non-`none` `fill` values with `currentColor` when the icon should be filled.
4. Replace non-`none` `stroke` values with `currentColor` when the icon is stroke-based.
5. Preserve `fill="none"` and `stroke="none"` when present.
6. Do not strip semantic paths, groups, masks, or clipping structure unless clearly unnecessary.
7. If the SVG has neither a `viewBox` nor usable dimensions, derive `viewBox` from numeric `width` and `height` when available, otherwise document the limitation.

---

## Rendering rules

- Size the icon through the rendered wrapper, not through hardcoded SVG dimensions.
- Do not rely only on normalization. Live rendering should still include defensive CSS overrides for nested SVG shapes.
- If the component already uses a working SVG color override pattern, reuse it.

Common failure mode: The component adds an `iconColor` field, but the SVG still keeps hardcoded `fill` or `stroke` values, so changing the color picker appears to do nothing. Fix by combining normalization with live CSS overrides.

---

## Safe patterns

Good stored SVG:

```js
'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="..." fill="currentColor"/></svg>'
```

Good live CSS pattern:

```css
.icon-wrap {
  width: 24px;
  height: 24px;
  color: var(--icon-color);
}

.icon-wrap svg {
  width: 100%;
  height: 100%;
  display: block;
}

.icon-wrap svg *[fill]:not([fill="none"]) {
  fill: currentColor !important;
}

.icon-wrap svg *[stroke]:not([stroke="none"]) {
  stroke: currentColor !important;
}
```

Avoid:

```js
'<svg width="24" height="24"><path fill="#000" d="..."/></svg>'
```

---

## Editor expectations

- `SvgPicker` should update the selected SVG value immediately.
- If a normalization helper is added, keep it near the editor state update path.
- Do not expose raw normalization controls to the editor unless the user asks.
- Editor icon previews (in table rows or drawers) should use the same `currentColor` override pattern as live rendering.

---

## Preserve existing behavior

- Keep existing field names such as `iconSvg`, `svg`, or similar unless the user asks to rename them.
- Preserve saved-state compatibility.
- Prefer normalizing legacy SVG values over replacing them outright.
- When introducing a new `iconColor` field, fall back to the existing color field (e.g. `accentColor`) for older saved items.

---

## Checklist

- [ ] Selected SVG can inherit color from `currentColor`
- [ ] Selected SVG can scale with wrapper width and height
- [ ] Root SVG has a valid `viewBox`
- [ ] Fixed root dimensions do not block resizing
- [ ] `fill="none"` and `stroke="none"` are preserved
- [ ] Live CSS still forces nested `fill` and `stroke` to follow `currentColor` when needed
- [ ] Editor previews use the same color override behavior as live rendering
- [ ] Existing saved SVG values remain supported
