---
name: expose-actions
description: "Rules and patterns for exposing inbound actions in Dot.vu components — defining actions in getActions(), implementing handlers in getActionHandlers(), and ensuring both functions are exported. Use when a component needs to receive triggerable actions from the studio (like Start Animation, Reset Form, Update Text)."
---

# Expose Actions

Use this skill when a component needs to receive actions (inbound events) that can be triggered from the Dot.vu studio or from other components.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md), [dotvu-api skill](../dotvu-api/SKILL.md), and the three runtime files.

---

## What are actions?

An **action** is a named command that the component receives from the studio or external flows. When an action is triggered:

1. The user right-clicks the component in the studio and selects an action from the menu
2. The studio calls the corresponding handler from `getActionHandlers()` in `live.js`
3. The handler updates the component state or triggers internal behavior

Actions are **inbound events** — they are received by the component from the external world. If you need a component to _emit_ events (like "button clicked" or "form submitted"), use `getTriggers` instead (see [triggers skill](../triggers/SKILL.md)).

---

## Simple actions (no configuration)

For actions that don't require user input (like "Start Animation", "Play Video"):

### editor.js — getActions

```javascript
export function getActions(_state) {
  return {
    startAnimation: {
      name: "Start Animation",
    },
  };
}
```

### live.js — getActionHandlers

```javascript
export function getActionHandlers({ setState }) {
  return {
    async startAnimation({ setComponentState }) {
      setComponentState((prev) => ({
        ...prev,
        _animationRevision: (Number(prev._animationRevision) || 0) + 1,
      }));
    },
  };
}
```

---

## Actions with configuration (user-provided inputs)

For actions that require the user to configure parameters (like "Update Target Number", "Set Text"):

### editor.js — getActions with Setting component

```javascript
export function getActions(_state) {
  return {
    updateTargetNumber: {
      name: "Update Target Number",
      info: { text: "Updates the number to count up to" },
      state: { targetNumber: createDynamicValue("number", 5000) },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label
              content="Target Number"
              help="Provide a number to animate to."
            />
            <DynamicValueInput
              value={actionState.targetNumber}
              onChange={(val) =>
                setActionState({ ...actionState, targetNumber: val })
              }
            />
          </SettingItem>
        );
      },
    },
  };
}
```

### live.js — getActionHandlers with dynamic value resolution

```javascript
export function getActionHandlers({ setState }) {
  return {
    async updateTargetNumber({ actionState, setComponentState }) {
      const newTarget = await resolveDynamicValue(actionState.targetNumber);
      setComponentState((prev) => ({
        ...prev,
        targetNumber: Number(newTarget) || 0,
      }));
    },
  };
}
```

---

## Key patterns

### 1. Action naming

- Use `camelCase` for action keys in the return object (e.g., `startAnimation`, `updateTargetNumber`)
- Use Title Case for the `name` property shown in the studio (e.g., `'Start Animation'`, `'Update Target Number'`)

### 2. State field for configured actions

When the action requires user input, define a `state` object with default values:

```javascript
state: {
  targetNumber: createDynamicValue("number", 5000);
}
```

This becomes `actionState` in the `Setting` component, allowing the user to configure the action each time it's called.

### 3. Setting component (optional)

Only define a `Setting` component if the action requires user input. Simple actions (no configuration) omit it entirely.

### 4. Action handler signature

Handler functions receive:

- `actionState` — the user's configured values (from the `state` object)
- `setComponentState` — function to update component state

Always use `async` and `await` for resolving dynamic values.

### 5. Both functions must be exported

For actions to appear in the studio, **both `getActions` and `getActionHandlers` must be exported** from their respective files, even if they return empty objects. The platform reads both to ensure the component is action-enabled.

```javascript
// editor.js
export function getActions(_state) {
  return {}; // even if empty
}

// live.js
export function getActionHandlers({ setState }) {
  return {}; // even if empty
}
```

---

## Common use cases

| Use case              | Action type | Handler updates              |
| --------------------- | ----------- | ---------------------------- |
| Play/pause animation  | Simple      | `_animationRevision` counter |
| Update displayed text | Configured  | Component text field         |
| Reset form            | Simple      | Form state fields            |
| Navigate to URL       | Configured  | Trigger internal navigation  |
| Update counter/number | Configured  | Component number field       |
| Toggle visibility     | Simple      | `isVisible` or similar flag  |

---

## Troubleshooting

**Actions don't appear in the studio:**

1. Verify `getActions()` is exported from `editor.js`
2. Verify `getActionHandlers()` is exported from `live.js`
3. Verify both functions return an object (not undefined or null)
4. Check browser console for errors in the action definition
5. Hard refresh the studio (Cmd+Shift+R or Ctrl+Shift+R)

**Action doesn't work when triggered:**

1. Verify the handler function name matches the action key (e.g., `startAnimation` in both places)
2. Verify the handler is using `setComponentState` (not `setState`) to update state
3. Verify dynamic values are resolved with `await resolveDynamicValue()`
4. Check the browser console for runtime errors in the handler

---

## Related skills

- [triggers](../triggers/SKILL.md) — for exposing outbound events from your component
- [settings-actionset](../settings-actionset/SKILL.md) — for allowing users to configure action destinations in the component editor
- [dynamic-text](../dynamic-text/SKILL.md) — example of the "Update Text" action pattern
