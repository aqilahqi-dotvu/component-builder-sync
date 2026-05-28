---
agent: agent
description: Add drag-to-reposition behavior to elements rendered directly inside a live.js component — pointer events, position state, and constraints.
---

# Add Live Drag-to-Reposition

Use this prompt when a component needs the user to drag elements around inside the component itself at runtime — not inside the editor settings panel.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:common.js
#file:editor.js
#file:live.js

---

## Step 1 — Clarify before building

Ask the user if the answer is not already clear:

1. **Which elements are draggable?** (e.g. image thumbnails, cards, overlays, stickers)
2. **What are the position units?** Choose one:
   - `%` relative to the component container — portable across sizes, recommended default
   - `px` from the container top-left — only if the component has a fixed known size
3. **Is there a snap or constraint?** (free movement, grid snap, bounded to container, bounded to a sub-region)
4. **Is position saved to state?** (persisted across page loads) or only local runtime state?
5. **Multi-item or single?** Does each item in a list carry its own position, or is there one global draggable?

Do not proceed until you know the element type and position unit.

---

## Step 2 — State shape

### Per-item position (list of draggables)

Store `pos: { x: number, y: number }` on each item in `getInitialState`. Units are percentage of the container (0–100):

```js
// common.js
export function getInitialState(state) {
  return {
    items: [{ id: "item-1", label: "Item 1", pos: { x: 20, y: 30 } }],
    ...state,
  };
}
```

### Single draggable

```js
// common.js
export function getInitialState(state) {
  return {
    elementPos: { x: 50, y: 50 },
    ...state,
  };
}
```

---

## Step 3 — live.js implementation

### Hooks and refs

```js
var containerRef = useRef(null); // attach to the outermost positioned div
var draggingRef = useRef(null); // { id, startX, startY, startPosX, startPosY }
```

No `useState` for drag tracking — use refs to avoid re-renders during `mousemove`.

### Pointer event handlers

Attach `onPointerDown` to each draggable element. Use pointer events (not mouse events) — they work on touch and desktop and automatically capture to the element.

```js
function handlePointerDown(e, itemId, currentPos) {
  e.preventDefault();
  e.currentTarget.setPointerCapture(e.pointerId);
  draggingRef.current = {
    id: itemId,
    startClientX: e.clientX,
    startClientY: e.clientY,
    startPosX: currentPos.x,
    startPosY: currentPos.y,
  };
}

function handlePointerMove(e) {
  var drag = draggingRef.current;
  if (!drag || !containerRef.current) return;
  var rect = containerRef.current.getBoundingClientRect();
  var dx = ((e.clientX - drag.startClientX) / rect.width) * 100;
  var dy = ((e.clientY - drag.startClientY) / rect.height) * 100;
  var newX = Math.max(0, Math.min(100, drag.startPosX + dx));
  var newY = Math.max(0, Math.min(100, drag.startPosY + dy));
  // Update state — per-item or single:
  setState(function (prev) {
    return {
      ...prev,
      items: prev.items.map(function (it) {
        return it.id === drag.id
          ? { ...it, pos: { x: Math.round(newX), y: Math.round(newY) } }
          : it;
      }),
    };
  });
}

function handlePointerUp() {
  draggingRef.current = null;
}
```

Attach `onPointerMove` and `onPointerUp` to the **container**, not the element:

```jsx
<div
  ref={containerRef}
  style={{ position: "relative", width: "100%", height: "100%" }}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
>
  {items.map(function (item) {
    return (
      <div
        key={item.id}
        style={{
          cursor: "grab",
          left: item.pos.x + "%",
          position: "absolute",
          top: item.pos.y + "%",
          transform: "translate(-50%, -50%)",
          touchAction: "none", // required — prevents browser scroll interference
          userSelect: "none",
        }}
        onPointerDown={function (e) {
          handlePointerDown(e, item.id, item.pos);
        }}
      >
        {/* element content */}
      </div>
    );
  })}
</div>
```

### Key rules

- `touchAction: 'none'` on every draggable element — without this, the browser intercepts touch and the pointer events won't fire on mobile.
- `e.currentTarget.setPointerCapture(e.pointerId)` on `pointerdown` — ensures `pointermove` and `pointerup` still fire even if the pointer leaves the element.
- Never attach `mousemove` to `document` — use pointer capture instead. It's cleaner, handles touch, and doesn't leak listeners.
- Use `Math.round` before saving `x`/`y` to avoid floating-point noise in saved state.
- Clamp to `[0, 100]` unless the design intentionally allows elements to overflow.

---

## Step 4 — CSS `cursor` feedback

```js
// While dragging, show 'grabbing' on the container to override child cursors
// Set cursor inline on the container based on whether draggingRef.current is set.
// Since draggingRef doesn't trigger re-render, use a state flag only for cursor:
var [isDragging, setIsDragging] = useState(false);

function handlePointerDown(e, itemId, currentPos) {
  // ...existing code...
  setIsDragging(true);
}

function handlePointerUp() {
  draggingRef.current = null;
  setIsDragging(false);
}
```

```jsx
<div
  ref={containerRef}
  style={{ cursor: isDragging ? 'grabbing' : 'default', position: 'relative' }}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
>
```

---

## Step 5 — Saving position to state

If `live.js` receives `state` as a prop and updates flow through `setState` (editor preview context), call `setState` directly from `handlePointerMove`.

If position should persist to saved component state (not just preview), call `setState` on `pointerup` only — not on every `pointermove` — to avoid excessive saves:

```js
function handlePointerUp() {
  var drag = draggingRef.current;
  draggingRef.current = null;
  setIsDragging(false);
  if (drag && finalPosRef.current) {
    setState(function (prev) {
      /* write finalPosRef.current to state */
    });
  }
}
```

Store the running position in a `finalPosRef` during `pointermove` and commit it only on `pointerup`.

---

## Step 6 — Editor-only guard

If drag-to-reposition should **only** work in the editor (not in published view), gate it:

```js
// live.js receives an `isEditor` prop from the Dot.vu runtime
export function Component({ state, setState, isEditor }) {
  // ...
  // Only attach pointer handlers if in editor
  var draggable = Boolean(isEditor);
}
```

```jsx
<div
  style={{ cursor: draggable ? 'grab' : 'default', /* ... */ }}
  onPointerDown={draggable ? function(e) { handlePointerDown(e, item.id, item.pos) } : undefined}
>
```

---

## Step 7 — Checklist before finishing

- [ ] `touchAction: 'none'` on every draggable element?
- [ ] `setPointerCapture` called on `pointerdown`?
- [ ] `onPointerMove` / `onPointerUp` on the **container**, not the element?
- [ ] Position stored as `%` of container (not `px`) unless the component has a fixed size?
- [ ] Values clamped and rounded before saving?
- [ ] `cursor: 'grabbing'` applied during drag?
- [ ] `useRef` used for drag tracking (not `useState`) to avoid mid-drag re-renders?
- [ ] If editor-only, guarded by `isEditor` prop?
- [ ] No `document.addEventListener` — pointer capture handles global tracking?
