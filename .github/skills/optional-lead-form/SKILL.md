---
name: optional-lead-form
description: 'Pattern for adding an optional lead form stage to a component (e.g., game, quiz, or calculator). Includes "Enable" toggle, placement control (before start vs before results), system/custom field management, validation, skipping, and data field exposure for CRM/Audience mapping.'
---

# Optional Lead Form Skill

Use this skill when a component needs an optional lead capture stage. Unlike a dedicated Form component, an Optional Lead Form is a conditional step in a larger experience (e.g., after a game but before the prize, or at the very start).

## Before you build — Required Decisions

| # | Question | Impact |
|---|---|---|
| 1 | Where should the form appear? | At the start (`'start'`) or before results (`'results'`) |
| 2 | Can users skip the form? | Adds a "Skip" button and `onLeadFormSkip` trigger |
| 3 | Which fields are enabled? | Standard system fields (Name, Email, Phone, Terms) vs Custom fields |

---

## 1. Common State (common.js)

Add these base settings and state fields to `getInitialState`.

```js
// Settings
isLeadFormEnabled: false,
leadFormPosition: 'start', // 'start' | 'results'
allowSkip: false,

// Content
leadFormTitle: 'Sign up to continue',
leadFormDescription: 'Please fill out the form below.',
leadFormButtonText: 'Submit',
leadFormSkipButtonText: 'Skip',

// State
leadFormSubmitted: false,
leadFormSkipped: false,

// Fields (use a helper to ensure system fields are initialized correctly)
fields: ensureSystemFields([]),
```

Include the `ensureSystemFields` helper in `common.js` to handle defaults for `name`, `email`, `phone`, and `terms`.

---

## 2. Editor Settings (editor.js)

Always place lead form settings in a dedicated **Lead Form** tab.

- **Enable Toggle:** `isLeadFormEnabled` (Checkbox).
- **Position:** `leadFormPosition` (Dropdown: "Before Start", "Before Results").
- **Fields Management:** Use a `TableContainer` with columns for "Enabled", "Label", "Placeholder", and "Required".
- **Skip Logic:** `allowSkip` (Checkbox) and `leadFormSkipButtonText` (TextInput).

---

## 3. Live Component (live.js)

### Visibility Logic

Decide if the form should be shown based on the current component stage and lead form state.

```js
const shouldShowForm = isLeadFormEnabled && 
  !leadFormSubmitted && 
  !leadFormSkipped && 
  ((leadFormPosition === 'start' && !hasStarted) || (leadFormPosition === 'results' && isComplete));
```

### Data Mapping

Expose form values as Data Fields so they can be mapped to External Sync or Audience Data.

```js
export function getDataFields({ componentState }) {
  const fields = componentState.fields || [];
  const dynamicFields = {};
  
  fields.forEach(f => {
    dynamicFields[f.id] = {
      name: f.label || f.id,
      value: componentState[`fieldValue_${f.id}`] || ''
    };
  });

  return {
    ...dynamicFields,
    leadFormSubmitted: { name: 'Lead Form Submitted', value: componentState.leadFormSubmitted }
  };
}
```

### Action Handlers

Handle `submitLeadForm` and `skipLeadForm` in `getActionHandlers`.

```js
async submitLeadForm({ setComponentState, componentState, runTrigger }) {
  // 1. Validate fields
  // 2. Map data to Audience
  // 3. Update state
  setComponentState(prev => ({ ...prev, leadFormSubmitted: true }));
  // 4. Run trigger
  runTrigger('onLeadFormSubmit');
}
```

---

## 4. Key Patterns

- **System Field Consistency:** Always use `name`, `email`, `phone`, and `terms` as IDs for the system fields to ensure platform compatibility.
- **Validation:** Show errors inline or in a `leadFormError` state field. Clear errors when the user starts typing.
- **Terms & Conditions:** The `terms` field should be a checkbox and usually includes a link (Rich Text or URL).
