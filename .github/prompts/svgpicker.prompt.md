---
agent: dotvu-component-builder
description: Normalize SvgPicker icons so selected SVGs always support dynamic color and size in Dot.vu components
---

# SVG Picker Normalization

Use this prompt when a Dot.vu component uses `SvgPicker` and the selected icons must always respond to runtime color and size styling.

Read first:

#file:../instructions/dotvu-component.instructions.md
#file:dotvu-api-reference.prompt.md
#file:../../common.js
#file:../../editor.js
#file:../../live.js
#file:../../templates/boilerplate.md

---

## Goal

When storing or rendering SVG chosen through `SvgPicker`, make sure the icon can always:

- inherit color from CSS via `currentColor`
- scale with the component's configured icon size
- keep a valid `viewBox` so resizing does not distort the icon

---

## Required behavior

- Treat `SvgPicker` output as editable SVG markup, not as a fixed-size asset.
- Normalize selected SVG strings before saving them into state when practical.
- Normalize SVG values at the real save boundaries that control the component, such as state defaults, editor update helpers, or both.
- Preserve a valid root `<svg ... viewBox="...">`.
- Do not rely on fixed root `width` and `height` attributes for sizing.
- Render icons inside a wrapper that controls icon size.
- Apply icon color through `color` on the wrapper or icon container.
- Ensure inner shapes use `currentColor` for visual color whenever possible.
- If the component supports both icon color and accent color, keep them as separate fields unless the user explicitly wants one shared color.

---

## Normalization rules

When normalizing SVG markup chosen by `SvgPicker`:

1. Keep or create a valid `viewBox` on the root `<svg>`.
2. Remove fixed root `width` and `height` attributes when they would block responsive sizing.
3. Replace non-`none` `fill` values with `currentColor` when the icon should be filled.
4. Replace non-`none` `stroke` values with `currentColor` when the icon is stroke-based.
5. Preserve `fill="none"` and `stroke="none"` when present.
6. Do not strip semantic paths, groups, masks, or clipping structure unless clearly unnecessary.
7. If the SVG has neither a `viewBox` nor usable dimensions, do one of these:
	 - derive `viewBox` from numeric `width` and `height` when available
	 - otherwise keep the SVG and document the limitation instead of inventing geometry

---

## Rendering rules

- Size the icon through the rendered wrapper, not through hardcoded SVG dimensions.
- In live rendering, ensure the icon wrapper and nested `svg` can scale to the configured size.
- Do not rely only on normalization. Live rendering should still include defensive CSS overrides for nested SVG shapes so icons continue to follow `currentColor` even when picked SVG markup contains explicit fills or strokes.
- Prefer CSS patterns like these when needed:
	- wrapper controls `width`, `height`, and `color`
	- nested `svg` uses `width: 100%` and `height: 100%`
	- nested SVG shapes are forced to `currentColor` when safe for the component
- If the component already uses a working SVG color override pattern, reuse it instead of inventing another one.

Common failure mode:

- The component adds an `iconColor` field, but the SVG still keeps hardcoded `fill` or `stroke` values, so changing the color picker appears to do nothing.
- Fix that by combining normalization with live CSS overrides on `fill` and `stroke`.

---

## Editor expectations

- `SvgPicker` should update the selected SVG value immediately.
- If a normalization helper is added, keep it near the editor state update path or shared state helper.
- Do not expose raw normalization controls to the editor unless the user asks for them.
- If the editor shows an icon preview in a table row or drawer, that preview should use the same `currentColor` override pattern as live rendering.

---

## Safe patterns

Good stored SVG example:

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

## Preserve existing behavior

- Keep existing field names such as `iconSvg`, `svg`, or similar unless the user asks to rename them.
- Preserve saved-state compatibility.
- Prefer normalizing legacy SVG values over replacing them outright.
- When introducing a new `iconColor` field, preserve backward compatibility by falling back to the existing color field such as `accentColor` for older saved items.
- Do not add unrelated icon libraries or dependencies.

---

## SVG reference

If the SVG normalization or rendering pattern is unclear, use `/templates/boilerplate.md` as a reference for how `SvgPicker`, SVG color overrides, `currentColor`, and icon sizing should work.

Do not copy unrelated boilerplate features.

---

## Checklist

- [ ] Selected SVG can inherit color from `currentColor`?
- [ ] Selected SVG can scale with wrapper width and height?
- [ ] Root SVG has a valid `viewBox`?
- [ ] Fixed root dimensions do not block resizing?
- [ ] `fill="none"` and `stroke="none"` are preserved?
- [ ] Live CSS still forces nested `fill` and `stroke` to follow `currentColor` when needed?
- [ ] Editor previews use the same color override behavior as live rendering when applicable?
- [ ] Existing saved SVG values remain supported?
