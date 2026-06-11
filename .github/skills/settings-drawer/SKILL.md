---
name: settings-drawer
<<<<<<< HEAD
description: "Rules and patterns for Drawer and DrawerSection in editor.js — isOpen prop, always-mounted pattern, drawer width matching settings panel width, section headings inside portaled drawers, and splitting large drawers into multiple DrawerSection blocks. Use when adding or editing an item-edit Drawer in a component."
=======
description: "Rules and patterns for Drawer and DrawerSection in editor.js — always-mounted pattern, drawer width matching settings panel width, navigation for multi-level data, and splitting content by concern. Use when adding or editing an item-edit Drawer in a component."
>>>>>>> 0223db7 (settings-drawer-update)
---

# Drawer Pattern

<<<<<<< HEAD
Use this skill when adding or editing an item-edit `Drawer` in a component.

---

## Requirements

- Use a single `Drawer` per editable list, mounted **always** (not conditionally).
- Place the `Drawer` as a sibling of `<Tabs>`, inside the `<>` fragment — **never** inside a `<Section>` or `<Tab>`.
- Control visibility with `isOpen` (not `open`).
- Track the selected item by ID, not index. Derive it from `state.items`.
- Guard drawer content with `{editingItem && <DrawerSection>...</DrawerSection>}` so it renders only when an item is selected.
- Do not add Save or Cancel buttons. Save every input change immediately.
- Close the drawer by clearing both `drawerOpen` and `editingId` in `onClose`.

---

## Correct mount position

```jsx
function Settings({ state, setState }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // ...

  return (
    <>
      <ScopedStyle>{EDITOR_STYLE}</ScopedStyle>
      <Tabs defaultActiveTab="content">
        <Tab id="content" title="Content">
          {/* TableContainer lives here */}
        </Tab>
      </Tabs>

      {/* ✅ Drawer is a top-level sibling of Tabs */}
      <Drawer
        isOpen={drawerOpen}
        title={editingItem ? editingItem.title || "Edit item" : "Edit item"}
        onClose={() => {
          setDrawerOpen(false);
          setEditingId(null);
        }}
      >
        {editingItem && <DrawerSection>{/* fields */}</DrawerSection>}
      </Drawer>
    </>
  );
}
```

**Wrong — Drawer nested inside Section:**

```jsx
// ❌ Will not open as an overlay
<Section>
  <TableContainer ... />
  <Drawer isOpen={drawerOpen} ...>
    ...
  </Drawer>
</Section>
```
=======
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
>>>>>>> 0223db7 (settings-drawer-update)

---

## Props reference

| Prop      | Type       | Notes                                                                                 |
| --------- | ---------- | ------------------------------------------------------------------------------------- |
| `isOpen`  | `boolean`  | Controls visibility. **Not** `open`.                                                  |
| `title`   | `string`   | Shown in the drawer header.                                                           |
<<<<<<< HEAD
| `onClose` | `function` | Called when the user closes the drawer. Clear both `drawerOpen` and `editingId` here. |
| `width`   | `number`   | Set to match the settings panel width (the `width` value in `getSettings`).           |

### Drawer width

Always set the `width` prop on `<Drawer>` to the same pixel value used for the settings panel in `getSettings`. This keeps the drawer the same width as the panel it slides out from, so the editor layout stays consistent.

```js
// getSettings
export function getSettings(state) {
  return {
    settings: {
      name: 'My Component',
      Setting: Settings,
      width: 360,         // ← settings panel width
      help: () => ({ ... })
    }
  }
}
```

```jsx
// Drawer — match the same width
<Drawer isOpen={drawerOpen} title="Edit Item" width={360} onClose={handleClose}>
  ...
</Drawer>
```

If the settings panel width is stored as a constant, reference it in both places:

```js
const SETTINGS_WIDTH = 360

export function getSettings(state) {
  return { settings: { ..., width: SETTINGS_WIDTH } }
}

// Inside Settings component:
<Drawer isOpen={drawerOpen} title="Edit Item" width={SETTINGS_WIDTH} onClose={handleClose}>
```

---

## Section headings inside Drawers

The `Drawer` in Dot.vu is portaled outside the `ScopedStyle` subtree. Class-based heading styles defined in `ScopedStyle` may not apply to drawer content. Use inline-style heading helpers for the drawer only.

### Recommended helpers

Add these to section **4. Small render pieces** in `editor.js`:

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

const DRAWER_SUBSECTION_HEADING_STYLE = {
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
  return <div style={DRAWER_SECTION_HEADING_STYLE}>{children}</div>;
}

function DrawerSubsectionHeading({ children }) {
  return <div style={DRAWER_SUBSECTION_HEADING_STYLE}>{children}</div>;
}
```

### Usage

```jsx
<Drawer isOpen={drawerOpen} title="Edit item" onClose={handleClose}>
  {editingItem && (
    <>
      <DrawerSection>
        <DrawerSectionHeading>Card</DrawerSectionHeading>
        {/* type, size */}
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionHeading>Content</DrawerSectionHeading>
        {/* title, subtitle, description, image */}
      </DrawerSection>

      <DrawerSection>
        <DrawerSectionHeading>Action</DrawerSectionHeading>
        {/* action type, URL, open in new tab, action set */}
      </DrawerSection>
    </>
  )}
</Drawer>
```

### Heading rules inside Drawers

- Treat each `DrawerSection` like a `Section`: one `DrawerSectionHeading` maximum, placed as the first child.
- Use `DrawerSubsectionHeading` only when a single `DrawerSection` contains two or more distinct control groups.
- Prefer splitting into multiple `DrawerSection` blocks before adding many sub-section headings.
- Keep heading text short — 1–3 words.
- Do not repeat the heading text in the `Label` immediately below it (e.g. if heading is "Badge", the label should be "Text" not "Badge text").

---

## Splitting a large DrawerSection

When a single `DrawerSection` grows beyond ~5 controls, split by concern:

| DrawerSection | Contents                                                |
| ------------- | ------------------------------------------------------- |
| Card          | type, size                                              |
| Content       | title, subtitle, description, image, image alt          |
| Action        | action type, URL, new tab toggle, action set            |
| Badge         | badge text, show badge                                  |
| Appearance    | text position, text alignment, show arrow, show overlay |

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
=======
| `onClose` | `function` | Called when closing the drawer. Clear `drawerOpen` and `selectedPath` (if used) here. |
| `width`   | `number`   | Set to match the settings panel width in `getSettings`.                               |
>>>>>>> 0223db7 (settings-drawer-update)
