---
name: drag-position-picker
description: Drag-and-drop viewport position picker for placing multiple floating elements (images, overlays) at arbitrary x%/y% positions in a Dot.vu component. Features a dark mini-viewport preview in the Drawer with draggable numbered handles, image thumbnails, an optional reference list of item labels centered inside, and per-item `images: [{ url, pos }]` state stored on each list item. Use when a component needs per-item, freely positioned floating elements rather than a fixed layout.
---

# Drag Position Picker Skill

Use this skill when a component has **per-item floating elements** (images, cards, overlays) that need to be placed at arbitrary positions on the viewport, and each item in a list can carry its own set of up to N elements.

The pattern includes:

- A `{ url, pos: { x, y } }` data shape stored on each list item
- A `PositionPicker` editor component — a dark mini-viewport preview with draggable colored handles and an optional reference list of sibling labels
- Numbered URL input rows in the Drawer with add/remove controls
- `fixed` or `absolute` CSS positioning in live.js driven by the saved `x%`/`y%` values

---

## 1. Data shape (`common.js`)

Each list item carries an `images` array. Each entry is `{ url: string, pos: { x: number, y: number } }` where `x` and `y` are percentages (0–100) of the viewport width and height respectively.

```js
// common.js
export function getInitialState(state) {
  return {
    items: [
      { id: "item-1", label: "Item One", url: "#", images: [] },
      // ...
    ],
    // ...
    ...state,
  };
}
```

> Items start with `images: []`. Images are added by the user in the Drawer. No default image URLs are set.

---

## 2. Constants (`editor.js` and `live.js`)

Declare these near the top of the **Constants** section in both files:

```js
// Default positions for the first 5 images — spread across left/right/center of the viewport
var DEFAULT_POSITIONS = [
  { x: 12, y: 55 },
  { x: 88, y: 27 },
  { x: 15, y: 20 },
  { x: 80, y: 68 },
  { x: 42, y: 82 },
];

// One color per image slot — maps index → CSS color string
var HANDLE_COLORS = ["#f57b37", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa"];
```

---

## 3. `PositionPicker` component (`editor.js`)

Place this in section **5. Helpers / sub-components**, before the main `Settings` component.

### How it works

- `containerRef` is attached to a dark `div` that acts as the mini-viewport.
- When a handle is `mousedown`-ed, `dragging` is set to that image's index.
- A `useEffect` on `dragging` attaches `document` `mousemove`/`mouseup` listeners, computes clamped `x`/`y` percentages from the container's `getBoundingClientRect`, and calls `onChange` with the updated images array.
- `onChangeRef` and `imagesRef` are ref-forwarded so the effect closure always reads current values without re-subscribing on every render.
- An optional `linkLabels` array renders sibling item names in the center of the preview as a reference. `activeLabel` marks which label belongs to the item being edited (shown bright/bold; others dimmed).

```jsx
// editor.js — section 5

var DEFAULT_POSITIONS = [
  { x: 12, y: 55 },
  { x: 88, y: 27 },
  { x: 15, y: 20 },
  { x: 80, y: 68 },
  { x: 42, y: 82 },
];
var HANDLE_COLORS = ["#f57b37", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa"];

function PositionPicker({ activeLabel, images, linkLabels, onChange }) {
  var [dragging, setDragging] = useState(null); // index | null
  var containerRef = useRef(null);
  var onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  var imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(
    function () {
      if (dragging === null) return;

      function onMouseMove(e) {
        if (!containerRef.current) return;
        var rect = containerRef.current.getBoundingClientRect();
        var x = Math.round(
          Math.max(
            5,
            Math.min(95, ((e.clientX - rect.left) / rect.width) * 100),
          ),
        );
        var y = Math.round(
          Math.max(
            5,
            Math.min(95, ((e.clientY - rect.top) / rect.height) * 100),
          ),
        );
        onChangeRef.current(
          imagesRef.current.map(function (img, i) {
            return i === dragging ? { url: img.url, pos: { x: x, y: y } } : img;
          }),
        );
      }

      function onMouseUp() {
        setDragging(null);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      return function () {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
    },
    [dragging],
  );

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          background: "#0f172a",
          border: "1px solid #374151",
          borderRadius: 8,
          cursor: dragging !== null ? "grabbing" : "default",
          height: 180,
          marginTop: 8,
          overflow: "hidden",
          position: "relative",
          userSelect: "none",
          width: "100%",
        }}
      >
        {/* Reference list — centered, non-interactive */}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            left: "50%",
            pointerEvents: "none",
            position: "absolute",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          {(linkLabels || []).map(function (label, i) {
            var isActive = label === activeLabel;
            return (
              <div
                key={i}
                style={{
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.28)",
                  fontSize: isActive ? 11 : 9,
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: "0.04em",
                  lineHeight: 1.3,
                  maxWidth: 110,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {label || "Item"}
              </div>
            );
          })}
        </div>

        {/* Draggable handles */}
        {images.map(function (img, idx) {
          var pos = img.pos || DEFAULT_POSITIONS[idx] || DEFAULT_POSITIONS[0];
          var color = HANDLE_COLORS[idx] || "#ffffff";
          return (
            <div
              key={idx}
              style={{
                alignItems: "center",
                background: color + "33",
                border: "2.5px solid " + color,
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
                boxSizing: "border-box",
                cursor: dragging === idx ? "grabbing" : "grab",
                display: "flex",
                flexShrink: 0,
                height: 40,
                justifyContent: "center",
                left: pos.x + "%",
                overflow: "hidden",
                position: "absolute",
                top: pos.y + "%",
                transform: "translate(-50%, -50%)",
                width: 40,
                zIndex: 2,
              }}
              title={"Image " + (idx + 1) + " — " + pos.x + "%, " + pos.y + "%"}
              onMouseDown={function (e) {
                e.preventDefault();
                setDragging(idx);
              }}
            >
              {img.url ? (
                <img
                  alt=""
                  src={img.url}
                  style={{
                    display: "block",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    width: "100%",
                  }}
                />
              ) : (
                <span
                  style={{
                    color: color,
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {idx + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {images.length > 0 && (
        <div
          style={{
            color: "#9ca3af",
            fontSize: 11,
            lineHeight: 1.5,
            marginTop: 6,
          }}
        >
          Drag to reposition ·
          {images.map(function (_, idx) {
            return (
              <span key={idx}>
                {" "}
                <span style={{ color: HANDLE_COLORS[idx] || "#fff" }}>
                  ■
                </span>{" "}
                {idx + 1}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Props

| Prop          | Type                               | Description                                                               |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| `images`      | `{ url: string, pos: { x, y } }[]` | Current images array (local state, not yet saved)                         |
| `onChange`    | `(images) => void`                 | Called on every mouse-move during drag with the updated array             |
| `activeLabel` | `string`                           | Label of the item being edited — highlighted bright in the reference list |
| `linkLabels`  | `string[]`                         | All item labels shown as a centered reference inside the picker           |

---

## 4. Drawer integration (`editor.js`)

### State in Settings component

```js
var [localImages, setLocalImages] = useState([]);
var editingItemRef = useRef(null);
// ...
editingItemRef.current = editingItem;
```

`localImages` is local UI state — it updates on every drag move without triggering a debounce lag. A separate `useEffect` debounces writes to the actual saved state.

### Sync effects

```js
// Seed local state when opening the drawer for a different item
useEffect(
  function () {
    if (editingItem) {
      setLocalImages(editingItem.images || []);
      // ...other field syncs
    }
  },
  [editingId],
);

// Debounce saving images back to state (300 ms)
useEffect(
  function () {
    if (!editingItemRef.current) return;
    var timer = setTimeout(function () {
      updateEditingItem({
        images: localImages.filter(function (img) {
          return img.url && img.url.trim();
        }),
      });
    }, 300);
    return function () {
      clearTimeout(timer);
    };
  },
  [localImages],
);
```

> Empty-URL entries are filtered out on save so only real images reach live.js.

### URL input rows + Add/Remove controls

```jsx
{
  localImages.map(function (img, idx) {
    var color = HANDLE_COLORS[idx] || "#ffffff";
    return (
      <div
        key={idx}
        style={{
          alignItems: "center",
          display: "flex",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            background: color,
            borderRadius: "50%",
            display: "inline-block",
            flexShrink: 0,
            height: 10,
            width: 10,
          }}
        />
        <span
          style={{ color: "#6b7280", flexShrink: 0, fontSize: 11, width: 14 }}
        >
          {idx + 1}
        </span>
        <input
          className="lp-url-input"
          placeholder="https://example.com/image.jpg"
          style={{ flex: 1, margin: 0 }}
          type="url"
          value={img.url || ""}
          onChange={function (e) {
            var val = e.currentTarget.value;
            setLocalImages(function (prev) {
              return prev.map(function (im, i) {
                return i === idx ? { url: val, pos: im.pos } : im;
              });
            });
          }}
        />
        <button
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            flexShrink: 0,
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
          }}
          title="Remove image"
          type="button"
          onClick={function () {
            setLocalImages(function (prev) {
              return prev.filter(function (_, i) {
                return i !== idx;
              });
            });
          }}
        >
          ×
        </button>
      </div>
    );
  });
}

{
  /* Add image button — hidden once limit is reached */
}
{
  localImages.length < 5 && (
    <button
      style={{
        background: "none",
        border: "1px dashed #d1d5db",
        borderRadius: 6,
        color: "#6b7280",
        cursor: "pointer",
        fontSize: 12,
        marginBottom: 12,
        padding: "5px 10px",
        width: "100%",
      }}
      type="button"
      onClick={function () {
        setLocalImages(function (prev) {
          return [
            ...prev,
            {
              pos: DEFAULT_POSITIONS[prev.length] || DEFAULT_POSITIONS[0],
              url: "",
            },
          ];
        });
      }}
    >
      + Add image
    </button>
  );
}

{
  /* Position picker — only shown when at least one image exists */
}
{
  localImages.length > 0 && (
    <SettingItem>
      <Label
        content="Image Positions"
        help="Drag each numbered handle to set where that image appears in the viewport. The item list shows in the center as a reference."
      />
      <PositionPicker
        activeLabel={editingItem.label}
        images={localImages}
        linkLabels={items.map(function (it) {
          return it.label;
        })}
        onChange={function (newImages) {
          setLocalImages(newImages);
        }}
      />
    </SettingItem>
  );
}
```

> **Limit** — `localImages.length < 5` gates the Add button. Adjust the constant to suit the component's max image count.

---

## 5. Runtime rendering (`live.js`)

### Helper constants and functions

```js
// live.js — section 2. Constants
var DEFAULT_POSITIONS = [
  { x: 12, y: 55 },
  { x: 88, y: 27 },
  { x: 15, y: 20 },
  { x: 80, y: 68 },
  { x: 42, y: 82 },
];
```

```js
// live.js — section 4. Helpers

// Convert pos {x, y} to inline style for the wrapper div
function getImageWrapStyle(pos, posMode) {
  return {
    left: pos.x + "%",
    pointerEvents: "none",
    position: posMode, // 'fixed' or 'absolute'
    top: pos.y + "%",
    transform: "translate(-50%, -50%)",
    zIndex: 9998,
  };
}

// Build renderable images for one item, with position fallbacks
function getItemImages(item) {
  return (item.images || [])
    .filter(function (img) {
      return img && img.url;
    })
    .map(function (img, idx) {
      return {
        url: img.url,
        pos: img.pos || DEFAULT_POSITIONS[idx] || DEFAULT_POSITIONS[0],
      };
    });
}
```

### Rendering images

```jsx
{
  /* Desktop hover — show entering images, animate out exiting images */
}
{
  !touchMode && (
    <div aria-hidden="true" role="presentation">
      {zones.hiding &&
        zones.hiding.map(function (img, idx) {
          if (!img.url) return null;
          return (
            <div
              key={"hide-" + idx + "-" + img.url}
              style={getImageWrapStyle(img.pos, posMode)}
            >
              <img
                alt=""
                className="lp-img lp-img--out"
                src={img.url}
                style={{
                  borderRadius: borderRadius,
                  display: "block",
                  height: imageHeightStyle,
                  width: imageWidthVw + "vw",
                }}
                onError={handleImgError}
              />
            </div>
          );
        })}
      {zones.showing &&
        zones.showing.map(function (img, idx) {
          if (!img.url) return null;
          return (
            <div
              key={"show-" + idx + "-" + img.url}
              style={getImageWrapStyle(img.pos, posMode)}
            >
              <img
                alt=""
                className="lp-img lp-img--in"
                src={img.url}
                style={{
                  borderRadius: borderRadius,
                  display: "block",
                  height: imageHeightStyle,
                  width: imageWidthVw + "vw",
                }}
                onError={handleImgError}
              />
            </div>
          );
        })}
    </div>
  );
}
```

### State shape for zones (hover/tap)

```js
// On hover enter:
setZones(function (prev) {
  return {
    showing: getItemImages(item),
    hiding: prev.showing,
  };
});

// On hover leave:
setZones(function (prev) {
  return {
    showing: null,
    hiding: prev.showing,
  };
});
```

---

## 6. Preloading images

```js
useEffect(function () {
  if (!state.preloadImages) return;
  items.forEach(function (item) {
    (item.images || []).forEach(function (img) {
      if (!img || !img.url) return;
      var imgEl = document.createElement("img");
      imgEl.src = img.url;
    });
  });
}, []);
```

---

## 7. Key rules

- **Position units are viewport percentages** — `pos.x` is `left: x%`, `pos.y` is `top: y%`, with `transform: translate(-50%, -50%)` centering the element on that point.
- **`fixed` vs `absolute` positioning** — expose an `imagePositionMode` state field (`'fixed'` default, `'absolute'` fallback) so users can switch if a parent CSS `transform` breaks `position: fixed`.
- **`localImages` is separate from saved state** — drag updates fire on every `mousemove`, so they must stay in local state and only be debounced into `setState` (300 ms). This prevents input lag.
- **Empty URL entries are filtered on save** — `localImages.filter(img => img.url && img.url.trim())` — so live.js never receives empty-URL slots.
- **`onChangeRef` / `imagesRef` pattern** — use refs inside the `mousemove` effect to always read the latest callback and data without re-registering listeners on every render.
- **Fallback positions** — always apply `img.pos || DEFAULT_POSITIONS[idx] || DEFAULT_POSITIONS[0]` so items saved before positions were added still render sensibly.
- **Max 5 images** — the `HANDLE_COLORS` array has 5 entries. Gate the Add button with `localImages.length < 5`.
