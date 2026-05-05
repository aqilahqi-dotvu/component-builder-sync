---
name: settings-actionset
description: "Rules and patterns for ActionSet controls in Dot.vu components. Use when a component has an action type like URL vs Trigger, configurable button actions, or per-item trigger behavior. When the trigger path is being added or edited, ask whether it should run an ActionSet directly or stay as an outbound trigger in getTriggers."
---

# ActionSet Pattern

Use this skill when a component has a configurable action that may switch between URL and Trigger, such as a CTA button, card click, item action, or per-row button in a settings table.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md), [dotvu-api skill](../dotvu-api/SKILL.md), and the three runtime files.

---

## Decision rule

If the component already has or needs an action type with a `trigger` option, ask this before implementing the trigger path:

- Should this trigger path run an `ActionSet` directly inside the component, or should it stay as a plain outbound trigger exposed from `getTriggers`?

Do not assume `ActionSet` automatically just because the action type says `trigger`.

Use `ActionSet` only when the user explicitly wants the button or element to execute actions directly inside the component.

Keep a plain outbound trigger when the user wants studio-level trigger wiring through `getTriggers`.

---

## When the answer is yes — use ActionSet

If the user confirms the trigger path should run actions directly:

- Import `ActionSet` from `@ui` in `editor.js`.
- Import `runActionSet` from `@data` in `live.js`.
- Store the configured actions in component state, for example `buttonActionSet`.
- Default missing action-set state to `[]` in `common.js`.
- In the editor, show `ActionSet` when `actionType === 'trigger'`.
- In live runtime, call `await runActionSet(...)` in the relevant click handler.
- Remove obsolete trigger-name inputs if they were only used to label generated triggers.
- Remove obsolete per-element trigger exports from `getTriggers` when the direct ActionSet replaces them.
- Update the help article so the editor behavior matches the runtime behavior.

### Editor example

```js
<SettingItem>
  <Label
    content="Action Set"
    help="Choose the actions that should run when this button is clicked."
  />
  <ActionSet
    value={Array.isArray(item.buttonActionSet) ? item.buttonActionSet : []}
    onChange={(buttonActionSet) =>
      updateItem(item.id, {
        buttonActionSet: Array.isArray(buttonActionSet) ? buttonActionSet : [],
      })
    }
  />
</SettingItem>
```

### Live example

```js
async function handleButtonClick(item, event) {
  if (!item || item.actionType !== "trigger") return;
  event.preventDefault();
  await runActionSet(
    Array.isArray(item.buttonActionSet) ? item.buttonActionSet : [],
  );
}
```

---

## When the answer is no — keep outbound triggers

If the user wants standard trigger wiring instead of direct action execution:

- Keep `getTriggers` as the source of outbound events.
- Do not import `ActionSet`.
- Do not import `runActionSet`.
- Keep the trigger naming scheme stable and saved-state compatible.
- Use `runTrigger('triggerName')` in live runtime.

---

## State normalization

If you add ActionSet-backed state to existing saved data:

- Normalize missing values to `[]`.
- Preserve existing saved objects and ids.
- Add new defaults before `...state` in `common.js` when practical.
- If the state is nested inside an item array, normalize it inside the item normalization helper.

Example:

```js
function getActionSetValue(value) {
  return Array.isArray(value) ? value : [];
}
```

---

## UX expectations

- Keep the action mode choice explicit, for example `URL` vs `Trigger`.
- Show only the controls relevant to the selected action type.
- When using `ActionSet`, label the field `Action Set`, not `Trigger Name`.
- Add a short help sentence when the difference between outbound triggers and direct ActionSet execution may be unclear.
- For `URL` actions, allow users to paste values starting with `www.` by normalizing to `https://` in live runtime before opening the link.

### URL normalization example (Open URL mode)

```js
function normalizeUrl(urlValue) {
  const trimmedUrl = String(urlValue || '').trim();
  if (trimmedUrl.toLowerCase().startsWith('www.')) {
    return `https://${trimmedUrl}`;
  }
  return trimmedUrl;
}

const normalizedUrl = normalizeUrl(item.buttonUrl);
if (normalizedUrl) {
  window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
}
```

---

## What not to do

```js
// Do not assume every trigger action should become an ActionSet.

// Do not keep both a generated outbound trigger and a direct ActionSet
// for the same click path unless the user explicitly asks for both.

// Do not store a non-array ActionSet value.
buttonActionSet: {
}

// Do not call runActionSet without guarding the value.
await runActionSet(item.buttonActionSet);
```
