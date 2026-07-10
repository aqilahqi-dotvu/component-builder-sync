---
name: triggers
description: "Rules and patterns for creating, naming, and exposing component triggers via getTriggers(). Use when a component fires events that should be available as right-click actions in the Dot.vu studio — or when triggers are defined but not appearing. Covers static and conditional trigger patterns, firing via runTrigger(), naming conventions, and troubleshooting missing triggers."
---

# Triggers Pattern

Use this skill when a component needs to fire events that external actions or flows can respond to, such as button clicks, state changes, animations starting/ending, or form submissions. Triggers appear in the **Triggers panel** (right-click on the component in the studio) and can be wired to other actions.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md), [dotvu-api skill](../dotvu-api/SKILL.md), and the three runtime files.

---

## What are triggers?

A **trigger** is a named event that fires from your component at runtime. When a trigger fires:

1. The component calls `runTrigger('triggerName')` in `live.js`
2. The studio detects the event and makes it available to other flows or actions
3. Users can wire workflows to respond to that trigger via the **Triggers panel**

Triggers are **outbound events** — they fire from the component to the external world. If you need a component to _receive_ actions (like "update text" or "reset form"), use `getActions` and `getActionHandlers` instead.

---

## Getting triggers to expose in the studio

For triggers to appear in the **Triggers panel** (right-click → Triggers), they must:

1. **Be defined in `getTriggers(state)`** in `editor.js` and exported
2. **Be fired from `live.js`** via `runTrigger('triggerName')`
3. **Have valid names** — use `camelCase` starting with `on` (e.g., `onButtonClick`, `onFormSubmit`)
4. **Have descriptive display names** in the trigger object (e.g., `{ name: 'On Button Click' }`)
5. **`getActions` must also be exported from `editor.js`** — even if empty. The platform reads `getActions` and `getTriggers` together; if `getActions` is absent, the module may fail silently and triggers will not appear.
6. **`getActionHandlers` must also be exported from `live.js`** — even if empty. Same reason.

```javascript
// editor.js — required even when no actions are used
export function getActions() {
  return {};
}

// live.js — required even when no actions are used
export function getActionHandlers() {
  return {};
}
```

---

## Static trigger pattern

Use when triggers are always present, regardless of component state.

### editor.js

```javascript
export function getTriggers(state) {
  return {
    onButtonClick: { name: "On Button Click" },
    onSubmit: { name: "On Form Submit" },
    onError: { name: "On Form Error" },
  };
}
```

### live.js

```javascript
export function Component({ state, setState, runTrigger }) {
  const handleClick = () => {
    // ... your logic
    runTrigger("onButtonClick");
  };

  const handleSubmit = (data) => {
    try {
      // ... submit logic
      runTrigger("onSubmit");
    } catch (err) {
      runTrigger("onError");
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

---

## Conditional trigger pattern

Use when triggers should only expose based on component settings. For example, a component might conditionally expose `onCardClick` only if the user enables click behavior.

### editor.js

```javascript
export function getTriggers(state) {
  return {
    // Always expose this trigger
    onHover: { name: "On Hover" },

    // Conditionally expose triggers based on state
    ...(state.exposeOnCardClick
      ? { onCardClick: { name: "On Card Click" } }
      : {}),

    ...(state.enableAnimation
      ? { onAnimationStart: { name: "On Animation Start" } }
      : {}),

    ...(state.enableAnimation
      ? { onAnimationEnd: { name: "On Animation End" } }
      : {}),
  };
}
```

The spread operator (`...`) conditionally includes triggers in the returned object. If the condition is false, an empty object `{}` is spread instead (adding nothing).

### common.js (state defaults)

```javascript
export function getInitialState(state) {
  return {
    exposeOnCardClick: true,
    enableAnimation: false,
    ...state,
  };
}
```

### live.js

```javascript
export function Component({ state, setState, runTrigger }) {
  const handleCardClick = () => {
    if (state.exposeOnCardClick) {
      runTrigger("onCardClick");
    }
  };

  const handleAnimationStart = () => {
    if (state.enableAnimation) {
      runTrigger("onAnimationStart");
    }
  };

  // ... rest of component
}
```

---

## Naming conventions

Follow the `on{EventName}` pattern so triggers read naturally in the studio:

| Trigger Name       | Display Name       | Use case                                              |
| ------------------ | ------------------ | ----------------------------------------------------- |
| `onButtonClick`    | On Button Click    | Button or clickable element was clicked               |
| `onSubmit`         | On Form Submit     | Form submitted successfully                           |
| `onError`          | On Form Error      | Form validation or submission failed                  |
| `onActivate`       | On Activate        | An inactive element became active (toggle, tab, etc.) |
| `onDeactivate`     | On Deactivate      | An active element became inactive                     |
| `onToggle`         | On Toggle          | State toggled (regardless of direction)               |
| `onCardClick`      | On Card Click      | A card in a list was clicked                          |
| `onItemAdded`      | On Item Added      | New item added to a list                              |
| `onItemRemoved`    | On Item Removed    | Item removed from a list                              |
| `onHover`          | On Hover           | User hovered over an element                          |
| `onAnimationStart` | On Animation Start | Animation or scroll trigger started                   |
| `onAnimationEnd`   | On Animation End   | Animation or scroll trigger ended                     |
| `onSuccess`        | On Success         | Async action completed successfully                   |
| `onFailure`        | On Failure         | Async action failed                                   |

---

## Studio exposure: How triggers appear

When you define triggers in `getTriggers()` and fire them in `live.js`:

1. **In the editor:** The Triggers panel shows all active triggers (based on current state)
2. **Right-click menu:** Users right-click the component → select "Triggers" tab
3. **Wiring:** Users drag from a trigger to any action (link, webhook, workflow, etc.)
4. **Runtime:** When `runTrigger('triggerName')` fires, the wired action executes

If a trigger is defined but not appearing, see the **Troubleshooting** section below.

---

## Firing triggers from live.js

In the `Component` export function, call `runTrigger()` when an event happens:

```javascript
export function Component({ state, setState, runTrigger }) {
  const handleClick = (e) => {
    // Your logic here

    // Fire the trigger
    runTrigger("onButtonClick");
  };

  return <button onClick={handleClick}>Click</button>;
}
```

**Rules:**

- Always call `runTrigger('triggerName')` inside event handlers (click, submit, hover, etc.)
- Use the exact trigger name from `getTriggers()` (case-sensitive)
- Fire triggers after your logic completes, not before
- You can fire multiple triggers in sequence

**Example: Toggle with multiple triggers**

```javascript
const handleToggle = () => {
  const nextState = !isActive;
  setIsActive(nextState);

  // Fire generic toggle trigger
  runTrigger("onToggle");

  // Fire specific trigger based on new state
  if (nextState) {
    runTrigger("onActivate");
  } else {
    runTrigger("onDeactivate");
  }
};
```

---

## Troubleshooting: Triggers not appearing in the Triggers panel

If a trigger is defined in `getTriggers()` but not showing up in the studio:

### Checklist

- [ ] **Is `getTriggers` exported from `editor.js`?**
  - Add/verify: `export function getTriggers(state) { ... }`
  - If missing, triggers won't be read by the studio

- [ ] **Is `getActions` exported from `editor.js`?**
  - The platform reads `getActions` and `getTriggers` together. If `getActions` is missing, the module may fail silently and **none** of the triggers will appear — even if `getTriggers` is correct.
  - Add the stub if absent: `export function getActions() { return {} }`

- [ ] **Is `getActionHandlers` exported from `live.js`?**
  - Same dependency as above. Add: `export function getActionHandlers() { return {} }`

- [ ] **Are trigger names valid JavaScript identifiers?**
  - Use `camelCase` starting with `on`: `onButtonClick` ✓, `on_button_click` ✗
  - No spaces, hyphens, or special characters (except `_`)

- [ ] **Are trigger names unique within the same component?**
  - Each trigger name must be used only once in `getTriggers()`
  - Duplicate names cause the later one to overwrite the first

- [ ] **Is the trigger object shaped correctly?**
  - Must be: `{ triggerName: { name: 'Display Name' } }`
  - Example: `{ onButtonClick: { name: 'On Button Click' } }` ✓
  - Example: `{ onButtonClick: 'On Button Click' }` ✗ (string instead of object)

- [ ] **Is the display name (`name` prop) a string?**
  - Use: `{ name: 'On Button Click' }` ✓
  - Avoid: `{ name: () => 'On Button Click' }` ✗ (functions are not supported)

- [ ] **For conditional triggers: is the condition actually true?**
  - If a trigger is wrapped in a conditional (`...(state.someFlag ? {...} : {})`), verify:
    - The state field exists and is being set
    - The condition evaluates to `true` when you expect it
    - Add console.log to debug: `console.log('getTriggers:', getTriggers(state))`

- [ ] **Is there a runtime error in live.js?**
  - Open browser DevTools (F12) → Console
  - Look for errors like `runTrigger is not defined` or `Uncaught ReferenceError`
  - If `runTrigger` is not being passed to `Component`, triggers won't fire even if defined

- [ ] **Is live.js calling `runTrigger()` with the correct name?**
  - Trigger name in `getTriggers`: `onButtonClick`
  - Trigger call in live.js: `runTrigger('onButtonClick')` (must match exactly, case-sensitive)
  - Typo: `runTrigger('onbuttonclick')` ✗ (wrong case)

- [ ] **Are you testing in the correct environment?**
  - Triggers appear in the **studio editor** (right-click → Triggers)
  - Triggers do NOT appear in Preview Mode (that's for user-facing runtime only)
  - Make sure you're checking the studio, not Preview

---

## Real-world example: Rich CTA Button

**Definition in editor.js:**

```javascript
export function getTriggers(state) {
  return {
    onButtonClick: { name: "On Button Click" },
    onActivate: { name: "On Activate" },
    onDeactivate: { name: "On Deactivate" },
    onToggle: { name: "On Toggle" },
  };
}
```

**Firing in live.js:**

```javascript
const handleClick = () => {
  runTrigger("onButtonClick");
  if (state.togglable) {
    const nextActive = !isActive;
    setIsActive(nextActive);
    runTrigger("onToggle");
    runTrigger(nextActive ? "onActivate" : "onDeactivate");
  }
};
```

**Studio behavior:**

- Every click fires `onButtonClick`
- If toggle mode is enabled, `onToggle` fires on every click
- `onActivate` fires only when transitioning from inactive → active
- `onDeactivate` fires only when transitioning from active → inactive

**Wiring in the studio:**
Users right-click the button → Triggers → drag `onActivate` to a "Send Email" action, for example. When the button becomes active, the email is sent.

---

## Related patterns

- **`settings-actionset`** — Use when a component needs to execute _actions directly_ (not just fire outbound triggers). ActionSets run _inside_ the component. Triggers are outbound _events_.
  - Triggers: External flows respond to your component's events
  - ActionSets: Your component executes external actions on demand

- **`getActions` and `getActionHandlers`** — Use when a component should _receive_ commands (like "Reset Form" or "Update Text"). That's the inbound side; triggers are the outbound side.

---

## Checklist before submitting

- [ ] `getActions` is exported from `editor.js` (even if it returns `{}`)
- [ ] `getActionHandlers` is exported from `live.js` (even if it returns `{}`)
- [ ] All triggers in `getTriggers()` are named `on{EventName}` (camelCase)
- [ ] All triggers have a `name` prop with a human-readable display name
- [ ] All triggers are fired in `live.js` via `runTrigger('triggerName')` when appropriate
- [ ] Trigger names in `getTriggers()` match the names passed to `runTrigger()` (case-sensitive)
- [ ] Conditional triggers use the spread operator pattern: `...(state.flag ? {...} : {})`
- [ ] If conditional, the state flags are initialized in `common.js`
- [ ] The help section in `getSettings()` documents what each trigger does
- [ ] No typos or whitespace mismatches between `getTriggers` and `runTrigger()` calls
