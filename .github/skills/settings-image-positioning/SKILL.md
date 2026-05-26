---
name: settings-image-positioning
description: Rules and patterns for adding a 3×3 image-position picker to a Dot.vu component — POSITION_GRID constant, per-item objectPosition state field, orange-highlighted button grid in the Drawer, and CSS object-position application in live.js. Use when a component renders images with object-fit:cover and needs a focal-point control.
---

# Image Position Skill

Use this skill when a component renders images with `object-fit: cover` (or similar cropping) and needs to expose an **Image position** control so the user can choose which part of the image stays visible when the image is cropped to fit its container.

---

## 1. State field

`objectPosition` is stored **per image** (not at the top-level state), with a fallback default of `'center center'`.

**When creating a new image item**, include the field:

```js
const newImage = { id: getUniqueId(), url: '', alt: '', objectPosition: 'center center' };
```

If the component only has a single image (not a list), add it to `getInitialState` in `common.js`:

```js
export function getInitialState(state) {
  return {
    imageUrl: '',
    objectPosition: 'center center',
    ...state,
  };
}
```

---

## 2. POSITION_GRID constant (editor.js)

Declare the grid near the top of `editor.js` in the **Constants** section:

```js
const POSITION_GRID = [
  ['left top',    'center top',    'right top'],
  ['left center', 'center center', 'right center'],
  ['left bottom', 'center bottom', 'right bottom'],
];
```

The values are standard CSS `object-position` / `background-position` keyword pairs.

---

## 3. Editor UI — 3×3 button grid

Render the picker inside a `DrawerSection` (or a `SettingItem` in the main settings panel for single-image components). Pair it with a `Label` that includes a `help` tooltip.

```jsx
<SettingItem>
  <Label
    content="Image position"
    help="Controls which part of the image stays visible when cropped to fit the card."
  />
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: 4 }}>
    {POSITION_GRID.map((row) =>
      row.map((pos) => {
        const isActive = (editingImage.objectPosition || 'center center') === pos;
        return (
          <button
            key={pos}
            style={{
              width: 32,
              height: 32,
              border: `1px solid ${isActive ? '#f57b37' : '#d1d5db'}`,
              borderRadius: 4,
              background: isActive ? 'rgba(245,123,55,0.10)' : '#f9fafb',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
              boxSizing: 'border-box',
            }}
            title={pos}
            type="button"
            onClick={() => updateEditingImage({ objectPosition: pos })}
          >
            <span style={{
              display: 'block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isActive ? '#f57b37' : '#d1d5db',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }} />
          </button>
        );
      })
    )}
  </div>
</SettingItem>
```

### Visual design rules

| State    | Border colour  | Background                  | Dot colour |
| -------- | -------------- | --------------------------- | ---------- |
| Inactive | `#d1d5db`      | `#f9fafb`                   | `#d1d5db`  |
| Active   | `#f57b37`      | `rgba(245,123,55,0.10)`     | `#f57b37`  |

Each cell is exactly **32×32 px** with `border-radius: 4px`. The dot indicator is **8×8 px**, centred absolutely. Set `title={pos}` for browser tooltip accessibility.

### Single-image variant (no Drawer)

Replace `editingImage.objectPosition` with `state.objectPosition` and `updateEditingImage` with an inline `setState` call:

```jsx
const isActive = (state.objectPosition || 'center center') === pos;
// ...
onClick={() => setState({ ...state, objectPosition: pos })}
```

---

## 4. Applying objectPosition in live.js

Pass the value to the rendered `<img>` element as an inline style. Always use a `|| 'center center'` fallback:

```jsx
<img
  src={img.url}
  alt={img.alt || ''}
  className="iss-card"
  style={{
    objectPosition: img.objectPosition || 'center center',
  }}
/>
```

The CSS class must set `object-fit: cover` (or `object-fit: contain`) for `object-position` to have any effect:

```css
.iss-card {
  object-fit: cover;
}
```

For a single-image component, read directly from `state`:

```jsx
style={{ objectPosition: state.objectPosition || 'center center' }}
```

---

## 5. Background-image variant

When the image is applied as a CSS `background-image` (e.g. on a `<div>`), use `backgroundPosition` instead:

```jsx
style={{
  backgroundImage: `url(${img.url})`,
  backgroundSize: 'cover',
  backgroundPosition: img.objectPosition || 'center center',
}}
```

The `POSITION_GRID` values are identical CSS keyword pairs and work for both `object-position` and `background-position`.

---

## 6. Checklist

- [ ] `POSITION_GRID` constant declared in the **Constants** section of `editor.js`
- [ ] `objectPosition` field included when creating new image items (default `'center center'`)
- [ ] 3×3 button grid rendered with orange active state
- [ ] `title={pos}` set on each button for accessibility
- [ ] `objectPosition || 'center center'` fallback used everywhere in `live.js`
- [ ] CSS class has `object-fit: cover` (or `background-size: cover`) so the property takes effect
