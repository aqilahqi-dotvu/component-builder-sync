---
name: resizable-both
description: "Make a Dot.vu component resizable in all directions — width, height, and diagonally — by setting both SizeType.RESIZABLE for width and height. Use when the component is a fixed-height visual (slider, map, video, canvas) that should let users drag to any size in the editor."
---

# Resizable Both Axes

Use this skill when a component needs to be freely resizable — draggable horizontally, vertically, and diagonally — in the Dot.vu editor.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## When to use

- The component is a visual element with no natural content height (slider, image, video, map, canvas, chart).
- The user should be able to drag the component to any width and height in the editor.
- The component must fill its container at all times.

Do **not** use this pattern for text-heavy components where height should grow with content — use `CONTENT_BASED` height instead.

---

## editor.js — getSizeTypes

Return `RESIZABLE` for both axes. No state argument is needed:

```js
import { SizeType } from "@constants";

export function getSizeTypes() {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.RESIZABLE,
  };
}
```

---

## live.js — HEIGHT_PATTERN comment

The first line of `live.js` must declare the height pattern:

```js
// HEIGHT_PATTERN: RESIZABLE
```

---

## live.js — root and card CSS

Use a two-layer structure: a centering flex root that fills the platform container, and a card inside that also fills the root. This keeps all content centered as the user resizes in any direction.

```css
.my-root {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.my-card {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
```

Do **not** set a fixed pixel height on either element. The platform controls the container size — both layers must respond by filling it.

---

## live.js — Component structure

```js
// HEIGHT_PATTERN: RESIZABLE
import { ScopedStyle } from "@utils";
import { useScaler } from "@hooks";
import { getInitialState } from "@common/index";
export { getInitialState };

export function Component({ state }) {
  const { s } = useScaler();

  const styles = `
    .my-root {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    .my-card {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
  `;

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div className="my-root">
        <div className="my-card">{/* component content */}</div>
      </div>
    </>
  );
}
```

Replace `my-root` and `my-card` with component-prefixed class names.

---

## Checklist

- [ ] `getSizeTypes` returns `RESIZABLE` for both `width` and `height`
- [ ] `// HEIGHT_PATTERN: RESIZABLE` is the first line of `live.js`
- [ ] Root element uses `width: 100%` and `height: 100%`
- [ ] Root element uses `box-sizing: border-box`
- [ ] No fixed pixel height on the root element
- [ ] All pixel values inside `Component` are wrapped in `s()`
