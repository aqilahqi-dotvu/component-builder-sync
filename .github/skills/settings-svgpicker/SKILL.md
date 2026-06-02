---
name: settings-svgpicker
description: "Normalize SvgPicker icons so selected SVGs always support dynamic color via currentColor and scale with wrapper size. Covers normalization rules, live CSS overrides for fill/stroke, viewBox preservation, and companion editor settings (color picker, size). Use when adding an icon picker to a component."
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
'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="..." fill="currentColor"/></svg>';
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
'<svg width="24" height="24"><path fill="#000" d="..."/></svg>';
```

---

## Companion settings (color picker and size)

When a component includes `SvgPicker`, it commonly needs companion settings to control icon color and size. All companion settings must affect the same selected icon — group them together in the editor under the same section or drawer where the picker lives.

### Color picker

- Add a `ColorPicker` field (e.g. `iconColor`) immediately after the `SvgPicker` in the editor.
- Use a sensible default (e.g. the component's accent color or `#000000`).
- Pass the color value to the live wrapper as a CSS variable (e.g. `--icon-color`).
- In live CSS, set `color: var(--icon-color)` on the wrapper so that `currentColor` in the SVG resolves to the chosen color.
- When migrating: fall back to an existing color field (e.g. `accentColor`) for items saved before the `iconColor` field existed.

Editor example:

```jsx
<Label text="Icon" />
<SvgPicker value={item.iconSvg} onChange={svg => update({ iconSvg: normalizeSvg(svg) })} />
<Label text="Icon Color" />
<ColorPicker value={item.iconColor ?? '#000000'} onChange={color => update({ iconColor: color })} />
```

### Size control

- Add a `NumberInput` (e.g. `iconSize`) for the icon size in pixels.
- Provide a sensible default (e.g. `32`) and reasonable Min / Max bounds (e.g. 8–128 px).
- Apply size to the wrapper element via inline style or a CSS variable (e.g. `--icon-size`).
- The wrapper should set both `width` and `height` from this value so the SVG scales uniformly.
- Pair with a `Label` and include a hint (e.g. "px") to clarify the unit.

Editor example:

```jsx
<Label text="Icon Size" />
<NumberInput
  value={item.iconSize ?? 32}
  min={8}
  max={128}
  onChange={v => update({ iconSize: v })}
/>
```

Live example:

```jsx
<div
  className="icon-wrap"
  style={{
    "--icon-color": item.iconColor ?? "#000000",
    "--icon-size": `${s(item.iconSize ?? 32)}px`,
  }}
  dangerouslySetInnerHTML={{ __html: item.iconSvg }}
/>
```

CSS:

```css
.icon-wrap {
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--icon-color);
  flex-shrink: 0;
}

.icon-wrap svg {
  width: 100%;
  height: 100%;
  display: block;
}
```

### Grouping rule

When `SvgPicker`, color picker, and size control all appear together, keep them grouped visually:

```jsx
<Label text="Icon" />
<SvgPicker ... />
<Label text="Icon Color" />
<ColorPicker ... />
<Label text="Icon Size" />
<NumberInput ... />
```

Do not scatter these controls across different sections — they all affect the same element and should stay together.

---

## Editor expectations

- `SvgPicker` should update the selected SVG value immediately.
- If a normalization helper is added, keep it near the editor state update path.
- Do not expose raw normalization controls to the editor unless the user asks.
- Editor icon previews (in table rows or drawers) should use the same `currentColor` override pattern as live rendering.
- Apply the same `iconColor` and `iconSize` values to editor previews (e.g. inside `TableContainer` rows or `Drawer` previews) so what the user sees in the editor matches live output.

---

## Preserve existing behavior

- Keep existing field names such as `iconSvg`, `svg`, or similar unless the user asks to rename them.
- Preserve saved-state compatibility.
- Prefer normalizing legacy SVG values over replacing them outright.
- When introducing a new `iconColor` field, fall back to the existing color field (e.g. `accentColor`) for older saved items.
- When introducing a new `iconSize` field, fall back to a sensible default (e.g. `32`) for older saved items.

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
- [ ] `iconColor` ColorPicker is grouped immediately after `SvgPicker` in the editor
- [ ] `iconSize` NumberInput is grouped with the picker and color controls
- [ ] Icon color and size are applied to editor previews (table rows, drawer) as well as live output
