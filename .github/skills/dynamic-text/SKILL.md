---
name: dynamic-text
description: "Pattern for making a component text field updateable at runtime via an inbound action (Update Text). Use whenever a component displays text that should be replaceable by an external trigger or action set in the Dot.vu studio."
---

# Dynamic Text

Use this skill when a component displays text that should be replaceable at runtime — for example, updating a headline, a callout, or a reveal phrase from an external action set in the studio.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## How it works

1. The text value lives in state (e.g. `state.text`) and is editable in the Content tab.
2. `getDataFields` exposes the current value so other components can read it.
3. `getActions` defines an **Update Text** inbound action with its own `state` (the new value) and a settings UI so the studio user can type the replacement text.
4. `getActionHandlers` in `live.js` receives the action and merges the new value into component state with `setComponentState`.

---

## editor.js — getDataFields

Expose the text field so the studio can read the current value:

```js
export function getDataFields() {
  return {
    text: { name: "Current Text", type: "text" },
  };
}
```

Use the same key as the state field.

---

## editor.js — getActions

```js
export function getActions() {
  return {
    updateText: {
      name: "Update Text",
      info: { text: "Updates the text dynamically" },
      state: { text: "New text..." },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Text" />
            <TextInput
              value={actionState.text}
              onChange={(e) =>
                setActionState({ ...actionState, text: e.currentTarget.value })
              }
            />
          </SettingItem>
        );
      },
    },
  };
}
```

Rules:

- `info` provides the default action state shown in the studio when the action is first added to an action set.
- `state` is the shape of the action's own state — not the component state. Keep it flat.
- `Setting` renders the action's configuration UI inside the studio action editor. Use `SettingItem` + `Label` + the appropriate input.
- Use `TextInput` for single-line text. Use a native `<textarea>` for multi-line text (see the `textarea` skill).

---

## live.js — getActionHandlers

```js
export function getActionHandlers() {
  return {
    async updateText({ actionState, setComponentState }) {
      const text = typeof actionState.text === "string" ? actionState.text : "";
      setComponentState((prev) => ({ ...prev, text }));
    },
  };
}
```

Rules:

- Always use `setComponentState` with a functional updater (`prev => ...`) to avoid stale state.
- **Always validate the incoming value** — check that `actionState.text` is a string before writing it to state. This prevents crashes if the action fires before it's configured in the studio.
- Do not use `setState` from the component — `getActionHandlers` runs outside the React component tree.
- The action name in `getActionHandlers` must exactly match the key in `getActions` (`updateText`).

---

## Extending to multiple text fields

If the component has more than one updatable text field, add a separate action per field or combine them into one action with multiple `state` keys:

```js
// Separate actions — clearer intent
export function getActions() {
  return {
    updateHeading: {
      name: "Update Heading",
      info: { heading: "New heading..." },
      state: { heading: "New heading..." },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Heading" />
            <TextInput
              value={actionState.heading}
              onChange={(e) =>
                setActionState({
                  ...actionState,
                  heading: e.currentTarget.value,
                })
              }
            />
          </SettingItem>
        );
      },
    },
    updateBody: {
      name: "Update Body",
      info: { body: "New body text..." },
      state: { body: "New body text..." },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Body" />
            <TextInput
              value={actionState.body}
              onChange={(e) =>
                setActionState({ ...actionState, body: e.currentTarget.value })
              }
            />
          </SettingItem>
        );
      },
    },
  };
}
```

```js
// live.js
export function getActionHandlers() {
  return {
    async updateHeading({ actionState, setComponentState }) {
      const heading =
        typeof actionState.heading === "string" ? actionState.heading : "";
      setComponentState((prev) => ({ ...prev, heading }));
    },
    async updateBody({ actionState, setComponentState }) {
      const body = typeof actionState.body === "string" ? actionState.body : "";
      setComponentState((prev) => ({ ...prev, body }));
    },
  };
}
```

---

## What not to do

```js
// Do NOT mutate state directly in getActionHandlers
async updateText({ actionState, setComponentState }) {
  state.text = actionState.text // wrong — state is read-only
}

// Do NOT use setState from Component — it is not available in getActionHandlers
async updateText({ actionState, setState }) {
  setState({ ...state, text: actionState.text }) // wrong
}

// Do NOT skip type validation — always check that incoming values are strings
async updateText({ actionState, setComponentState }) {
  setComponentState(prev => ({ ...prev, text: actionState.text })) // wrong — crashes if actionState.text is undefined
}

// Do NOT skip getDataFields — without it the current value is not readable by other components
// Do NOT skip the info field — the studio needs a default to show before the user types
```

---

## Defensive rendering

When rendering the text field in the Component, always guard against non-string values:

```js
const words = String(state.text ?? "").split(" ");
```

This prevents crashes if state is corrupted, persisted incorrectly, or updated before validation was added.
