---
name: form-component
description: 'Feature checklist and requirements for Dot.vu form components — input fields with labels and placeholders, validation before submit, data field exposure, submit/loading/success states, reset behavior, triggers (onSubmit, onError, onSuccessAction), and inbound actions (resetForm, confirmSubmit). Use when building or reviewing any form component.'
---

# Form — Feature Requirements

Use this skill as a checklist when building or reviewing any form component. Every section below is a required feature area unless marked optional.

---

## 1. Input fields

Each field must have:

- **Label** — editable string, shown above the input
- **Placeholder** — editable string, shown inside the input when empty
- **Required toggle** — editor checkbox per field; blocks submission if empty
- **Value in state** — e.g. `nameValue`, `emailValue` — starts as `''`

Supported field types and their validation rules:

| Field type | Validation |
|---|---|
| Text | Non-empty if required |
| Email | Non-empty if required + valid email format |
| Phone | Non-empty if required |
| Textarea | Non-empty if required |
| Dropdown | Non-empty if required |
| Checkbox (opt-in) | Must be `true` if required |
| Radio group | Non-empty selection if required |
| Number | Non-empty if required; optionally min/max |

---

## 2. Validation

- Validate all fields in `getActionHandlers` before any fetch or trigger call
- Show a single `formError` message (first failing rule wins) above the submit button
- Keep the form visible and editable while the error is shown — do not hide or reset fields on error
- Clear `formError` when the user starts correcting their input or on the next submit attempt

Required validation checks:

- [ ] Empty check for all required fields
- [ ] Email format check for email fields: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- [ ] Opt-in checkbox must be `true` if marked required
- [ ] Validation runs before `isSubmitting` is set to `true`

---

## 3. Exposed data fields

All input values must be registered in `getDataFields`:

```js
export function getDataFields(state) {
  return {
    nameValue:  { name: 'Name',  type: 'text' },
    emailValue: { name: 'Email', type: 'text' },
    isSubmitted: { name: 'Is Submitted', type: 'boolean' }
  }
}
```

Rules:
- Use the same key names as the state fields
- Always expose `isSubmitted`
- Expose all user-entered values, not just the ones used in the trigger payload

---

## 4. Submit behavior

- Submit button shows a loading label (e.g. `'Sending…'`) and is disabled while `isSubmitting` is `true`
- On success: set `isSubmitted: true`, clear `formError`, fire `onSubmit` trigger
- On failure: set `isSubmitting: false`, set `formError` to a user-friendly message, keep form visible
- Optional: post form data to an external URL (`submitUrl`) before firing the trigger

| State | Button label | Disabled |
|---|---|---|
| Idle | `state.submitLabel` (editable) | No |
| Submitting | `'Sending…'` or editable loading label | Yes |
| Submitted | Hidden (success view shown instead) | — |

---

## 5. After-submit view

When `isSubmitted` is `true`, replace the form with a success view:

- **Success heading** — editable string
- **Success message** — editable string
- **Reset button** — shown by default; label editable; calls the `resetForm` action
- **Optional extra CTA button** — toggle in editor; editable label; fires `onSuccessAction` trigger

---

## 6. Reset

The `resetForm` action clears the form back to its initial input state:

- All `*Value` fields set to `''` (or `false` for checkboxes)
- `isSubmitted` → `false`
- `isSubmitting` → `false`
- `formError` → `''`

Reset can be triggered two ways:
1. The reset button in the success view (always present)
2. The `resetForm` inbound action (so the studio can reset the form externally)

---

## 7. Triggers (outbound)

| Name | When | Payload |
|---|---|---|
| `onSubmit` | After successful validation and optional fetch | All `*Value` fields as a plain object |
| `onError` | After a failed fetch | `{ error: 'string' }` |
| `onSuccessAction` | When the optional extra CTA button is clicked | `{}` |

---

## 8. Actions (inbound)

| Name | What it does |
|---|---|
| `resetForm` | Clears all input values, resets `isSubmitted`, `isSubmitting`, `formError` |
| `confirmSubmit` | Sets `isSubmitted: true`, clears `formError` and `isSubmitting`. Use when an external tool signals submission success. Does not re-fire `onSubmit`. |

---

## 9. Editor settings

### Content tab

```
copy
  Form heading
  Form description

fields
  Per field: label, placeholder, required toggle

confirmation (only when opt-in checkbox field is included)
  Checkbox label

submission
  Submit button label
  Submit URL  (only when webhook posting is needed)

success
  Success heading
  Success message
  Reset button label
  Extra CTA button toggle + label  (optional)
```

### Style tab

```
typography   →  Label font + size, body font + size
colors       →  Field border color, error color, button background, button text
layout       →  Field border radius, button border radius, field gap, form padding
```

---

## 10. Checklist

### Fields and validation

- [ ] Every field has an editable label and placeholder in the editor
- [ ] Every field has a required toggle in the editor
- [ ] Validation runs before submit, not inside `Component`
- [ ] Email fields validated against format regex
- [ ] `formError` shown above submit button, cleared on next attempt
- [ ] Form stays visible and editable when `formError` is set

### Data exposure

- [ ] All `*Value` fields registered in `getDataFields`
- [ ] `isSubmitted` registered in `getDataFields`

### Submit behavior

- [ ] Submit button disabled and relabelled while `isSubmitting` is `true`
- [ ] `onSubmit` trigger fired with all field values as payload
- [ ] `onError` trigger fired on fetch failure

### After-submit view

- [ ] Form replaced with success view when `isSubmitted` is `true`
- [ ] Success heading and message are editable
- [ ] Reset button present in success view
- [ ] Optional extra CTA button toggle exists in editor
- [ ] Extra CTA button fires `onSuccessAction` trigger when clicked

### Reset

- [ ] `resetForm` action declared in `getActions`
- [ ] `resetForm` clears all input values and runtime state fields
- [ ] Reset button in success view calls `resetForm`

### External submission confirmation

- [ ] `confirmSubmit` action declared in `getActions`
- [ ] `confirmSubmit` sets `isSubmitted: true`, clears `isSubmitting` and `formError`
- [ ] `confirmSubmit` does not re-fire the `onSubmit` trigger

### Implementation

- [ ] `// HEIGHT_PATTERN: CONTENT_BASED` at top of `live.js`
- [ ] `const { s } = useScaler()` is first line inside `Component`
- [ ] Every px value in `live.js` wrapped in `s()`
- [ ] `<ScopedStyle>` used — no raw `<style>` tags
- [ ] `<form onSubmit={e => { e.preventDefault(); handleSubmit() }}>`
- [ ] No API keys or secrets in state
- [ ] Each exported function appears exactly once

---

## What not to do

```
❌ Field value not in getDataFields — studio cannot read or use it
❌ No reset button after submit — user is stuck on the success screen
❌ Validation inside Component — put it in getActionHandlers
❌ Form stays visible after isSubmitted is true — replace it with the success view
❌ No formError shown — user has no idea why the submit did nothing
```
