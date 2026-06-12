---
name: settings-drawer
description: "Rules and patterns for Drawer and DrawerSection in editor.js — always-mounted pattern, drawer width matching settings panel width, navigation for multi-level data, and splitting content by concern. Use when adding or editing an item-edit Drawer in a component."
---

# Drawer Pattern

Use this skill when adding or editing an item-edit `Drawer` in a Dot.vu component settings panel. The drawer is the standard way to edit details for items in a list (e.g., cards, slides, menu items).

---

## Core Requirements

- **Always Mounted**: Mount the `<Drawer>` always (not conditionally). Control visibility with the `isOpen` prop.
- **Top-level Placement**: Place the `<Drawer>` as a sibling of `<Tabs>`, inside a fragment `<>` — **never** inside a `<Section>` or `<Tab>`.
- **Match Width**: Always set the `width` prop on `<Drawer>` to match the settings panel `width` defined in `getSettings`.
- **Immediate Save**: Edits inside the drawer save immediately to state. Do not add "Save" or "Cancel" buttons.
- **Content Guards**: Wrap drawer content in a guard (e.g., `{activeItem && <DrawerSection>...}`) to ensure it only renders when an item is being edited.

---

## Multi-level Navigation (Drill-down Pattern)

For components with nested data (e.g., sub-menus, nested items), use a single drawer with path-based navigation rather than opening multiple separate drawers.

### Requirements

- **Path State**: Track the current navigation path in local state (e.g., `const [selectedPath, setSelectedPath] = useState([])`).
- **Back Button**: Provide a "← Back" button at the top of the `DrawerSection` whenever `selectedPath.length > 0`.
- **Path Label**: Display the current location using the format `Path: Home > Level 1`. This should appear below the Back button to give the user context.
- **On Close**: Clear both `drawerOpen` and `selectedPath` in the `onClose` handler to reset position.

### Example logic

```js
const [selectedPath, setSelectedPath] = useState([]);

const goToChild = (childId) => {
  setSelectedPath((prev) => [...prev, childId]);
};

const goToParent = () => {
  setSelectedPath((prev) => prev.slice(0, -1));
};

// Item selection
const activeItem = useMemo(() => {
  // Resolve item via path indices or IDs
  return getItemAtPath(data, selectedPath);
}, [data, selectedPath]);
```

---

## Structure and Organization

### DrawerSection

- Every piece of content inside a `<Drawer>` must be wrapped in a `<DrawerSection>`.
- For large drawers, split fields into multiple `<DrawerSection>` blocks by concern (Content, Design, Behavior).

### Section Headings

The `<Drawer>` is portaled outside the `ScopedStyle` subtree. Use inline-style heading helpers for the drawer only.

```js
const DRAWER_SECTION_HEADING_STYLE = {
  margin: "0 0 12px 0",
  color: "#000000",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  lineHeight: 1.2,
  textTransform: "uppercase",
};

function DrawerSectionHeading({ children }) {
  return <div style={DRAWER_SECTION_HEADING_STYLE}>{children}</div>;
}
```

---

## Props reference

| Prop      | Type       | Notes                                                                                 |
| --------- | ---------- | ------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`  | Controls visibility. **Not** `open`.                                                  |
| `title`   | `string`   | Shown in the drawer header.                                                           |
| `onClose` | `function` | Called when closing the drawer. Clear `drawerOpen` and `selectedPath` (if used) here. |
| `width`   | `number`   | Set to match the settings panel width in `getSettings`.                               |

| Content | title, subtitle, description, image, image alt |
| Action | action type, URL, new tab toggle, action set |
| Badge | badge text, show badge |
| Appearance | text position, text alignment, show arrow, show overlay |

Each `DrawerSection` renders its own separator in the Dot.vu UI, making the drawer scannable without headings alone.

---

## Drawer open/close pattern

```js
function handleEditItem(id) {
  setEditingId(id)
  setDrawerOpen(true)
}

// In onClose:
onClose={() => { setDrawerOpen(false); setEditingId(null) }}
```

Do **not** conditionally mount the Drawer (`{editingItem && <Drawer>}`). Mount it always so the open transition works. Guard the _content_ inside with `{editingItem && ...}`.

---

name: settings-drawer
description: "Rules and patterns for Drawer and DrawerSection in editor.js — always-mounted pattern, drawer width matching settings panel width, navigation for multi-level data, and splitting content by concern. Use when adding or editing an item-edit Drawer in a component."

---

# Drawer Pattern

Use this skill when adding or editing an item-edit `Drawer` in a Dot.vu component settings panel. The drawer is the standard way to edit details for items in a list (e.g., cards, slides, menu items).

---

## Core Requirements

- **Always Mounted**: Mount the `<Drawer>` always (not conditionally). Control visibility with the `isOpen` prop.
- **Top-level Placement**: Place the `<Drawer>` as a sibling of `<Tabs>`, inside a fragment `<>` — **never** inside a `<Section>` or `<Tab>`.
- **Match Width**: Always set the `width` prop on `<Drawer>` to match the settings panel `width` defined in `getSettings`.
- **Immediate Save**: Edits inside the drawer save immediately to state. Do not add "Save" or "Cancel" buttons.
- **Content Guards**: Wrap drawer content in a guard (e.g., `{activeItem && <DrawerSection>...}`) to ensure it only renders when an item is being edited.

---

## Multi-level Navigation (Drill-down Pattern)

For components with nested data (e.g., sub-menus, nested items), use a single drawer with path-based navigation rather than opening multiple separate drawers.

### Requirements

- **Path State**: Track the current navigation path in local state (e.g., `const [selectedPath, setSelectedPath] = useState([])`).
- **Back Button**: Provide a "← Back" button at the top of the `DrawerSection` whenever `selectedPath.length > 0`.
- **Path Label**: Display the current location using the format `Path: Home > Level 1`. This should appear below the Back button to give the user context.
- **On Close**: Clear both `drawerOpen` and `selectedPath` in the `onClose` handler to reset position.

### Example logic

```js
const [selectedPath, setSelectedPath] = useState([]);

const goToChild = (childId) => {
  setSelectedPath((prev) => [...prev, childId]);
};

const goToParent = () => {
  setSelectedPath((prev) => prev.slice(0, -1));
};

// Item selection
const activeItem = useMemo(() => {
  return getItemAtPath(data, selectedPath);
}, [data, selectedPath]);
```

---

## Structure and Organization

### DrawerSection

- Every piece of content inside a `<Drawer>` must be wrapped in a `<DrawerSection>`.
- For large drawers, split fields into multiple `<DrawerSection>` blocks by concern:

| DrawerSection | Contents                                                |
| ------------- | ------------------------------------------------------- |
| Card          | type, size                                              |
| Content       | title, subtitle, description, image, image alt          |
| Action        | action type, URL, new tab toggle, action set            |
| Appearance    | text position, text alignment, show arrow, show overlay |

### Section Headings

The `<Drawer>` is portaled outside the `ScopedStyle` subtree. Use inline-style heading helpers for the drawer only.

```js
function DrawerSectionHeading({ children }) {
  return <div style={DRAWER_SECTION_HEADING_STYLE}>{children}</div>;
}
```

- **DrawerSectionHeading**: Use for main groups (uppercase, bold).
- **DrawerSubsectionHeading**: Use for sub-groups within a section (capitalized, bold).

---

## Props reference

| Prop      | Type       | Notes                                                                                 |
| --------- | ---------- | ------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`  | Controls visibility. **Not** `open`.                                                  |
| `title`   | `string`   | Shown in the drawer header.                                                           |
| `onClose` | `function` | Called when closing the drawer. Clear `drawerOpen` and `selectedPath` (if used) here. |
| `width`   | `number`   | Set to match the settings panel width in `getSettings`.                               |
