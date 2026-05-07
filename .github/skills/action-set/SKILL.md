---
name: action-set
description: "Rules and patterns for using the Action Set picker in editor.js — configure action execution directly from settings, show picker conditionally, and execute the selected Action Set at runtime without trigger wiring. Use when adding CTA or interaction-driven Action Set behavior to a component."
---

# Action Set — Usage Rule

## Critical API requirements

- Use `ActionSet` from `@ui` as the settings control for selecting an Action Set.
- Store the selected Action Set value in component state (for example `ctaActionSet`).
- Use a short `Label` and place detailed explanation in `help`.
- Show the `ActionSet` picker only when the related mode is enabled (for example Button Action = Run Action Set).
- Execute the selected Action Set in `live.js` using `runActionSet` from `@data`.

---

## Rule

When a component should run an Action Set from a user interaction (like CTA click), the Action Set must be selected directly in component settings.

- Do use a clear mode switch first (for example a dropdown with `Open URL` and `Run Action Set`).
- Do show the `ActionSet` picker only when `Run Action Set` is selected.
- Do keep the picker label short and self-explanatory.
- Do use `Label help` for context instead of an extra info banner.
- Do execute the selected Action Set directly in runtime logic.
- Do not require trigger wiring for this pattern.
- Do not leave dead trigger code paths when moving to direct Action Set execution.

---

## Patterns

### Simple Action Set picker — no extra context needed

```jsx
<SettingItem>
  <Label content="CTA Action Set" />
  <ActionSet
    value={state.ctaActionSet}
    onChange={(ctaActionSet) => setState({ ...state, ctaActionSet })}
  />
</SettingItem>
```

### Action Set picker with mode selection

```jsx
<SettingItem>
  <Label
    content="Button Action"
    help="Choose what happens when the button is clicked."
  />
  <Dropdown
    value={state.buttonActionType || "url"}
    options={[
      { value: "url", text: "Open URL" },
      { value: "actionSet", text: "Run Action Set" },
    ]}
    onChange={(buttonActionType) => setState({ ...state, buttonActionType })}
  />
</SettingItem>;

{
  (state.buttonActionType || "url") === "actionSet" ? (
    <SettingItem>
      <Label
        content="CTA Action Set"
        help="Pick the Action Set to run when the CTA is clicked."
      />
      <ActionSet
        value={state.ctaActionSet}
        onChange={(ctaActionSet) => setState({ ...state, ctaActionSet })}
      />
    </SettingItem>
  ) : null;
}
```

### Runtime execution in live.js (no triggers)

```js
import { runActionSet } from "@data";

const handleButtonClick = (event) => {
  event.stopPropagation();

  if ((state.buttonActionType || "url") === "actionSet") {
    if (state.ctaActionSet) {
      runActionSet(state.ctaActionSet, state);
    }
    return;
  }

  // URL behavior
  if (!validatedButtonUrl) {
    return;
  }

  if (state.buttonOpenInNewTab !== false) {
    window.open(validatedButtonUrl, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = validatedButtonUrl;
};
```

---

## Quick reference

| Situation                                 | Pattern                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| CTA should run Action Set from settings   | `Button Action` mode + conditional `ActionSet` picker                       |
| Keep URL and Action Set behavior together | Branch by mode in click handler (`url` vs `actionSet`)                      |
| Avoid trigger dependency                  | Execute with `runActionSet(selectedActionSet, state)` directly in `live.js` |
| Explain behavior in editor                | Put explanation in `Label help`, not a persistent banner                    |

---

## What not to do

```jsx
// ❌ Using text input for Action Set id/name instead of ActionSet picker
<TextInput value={state.ctaActionSet} onChange={...} />

// ❌ Always showing ActionSet picker even when mode is URL
<ActionSet value={state.ctaActionSet} onChange={...} />

// ❌ Keeping trigger-based wiring for CTA when direct Action Set execution is required
runTrigger("onCTAClick")

// ❌ Forgetting runtime execution after selection in editor
// (picker exists, but no runActionSet call in click handler)

// ❌ Missing state default for selected Action Set in common.js
// ctaActionSet should be initialized before ...state
```
