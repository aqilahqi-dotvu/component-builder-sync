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

### System Fields Helper (common.js)

Include this helper to manage standard fields (Name, Email, Phone, Terms):

```js
const SYSTEM_FIELD_DEFAULTS = {
  name: { id: 'name', type: 'text', isSystem: true, label: 'Full Name', placeholder: 'John Doe', required: true, enabled: true },
  email: { id: 'email', type: 'email', isSystem: true, label: 'Email Address', placeholder: 'john@example.com', required: true, enabled: true },
  phone: { id: 'phone', type: 'phone', isSystem: true, label: 'Phone Number', placeholder: '+1 234 567 8900', required: true, enabled: true },
  terms: { id: 'terms', type: 'checkbox', isSystem: true, label: 'I agree to the', linkText: 'Terms & Conditions', linkUrl: '#', required: true, enabled: true }
};

export function ensureSystemFields(fields) {
  const input = Array.isArray(fields) ? fields : [];
  const map = new Map();
  input.forEach(f => {
    if (f && f.id) {
      if (SYSTEM_FIELD_DEFAULTS[f.id]) {
        map.set(f.id, { ...SYSTEM_FIELD_DEFAULTS[f.id], ...f, isSystem: true });
      } else {
        map.set(f.id, { ...f, isSystem: false });
      }
    }
  });

  const next = [
    map.get('name') || { ...SYSTEM_FIELD_DEFAULTS.name },
    map.get('email') || { ...SYSTEM_FIELD_DEFAULTS.email },
    map.get('phone') || { ...SYSTEM_FIELD_DEFAULTS.phone },
    map.get('terms') || { ...SYSTEM_FIELD_DEFAULTS.terms }
  ];

  input.forEach(f => {
    if (f && f.id && !SYSTEM_FIELD_DEFAULTS[f.id]) {
      next.push(map.get(f.id));
    }
  });

  return next;
}
```

---

## 2. Editor Settings (editor.js)

Always place lead form settings in a dedicated **Lead Form** tab.

- **Enable Toggle:** `isLeadFormEnabled` (Checkbox).
- **Position:** `leadFormPosition` (Dropdown: "Before Start", "Before Results").
- **Fields Management:** Use a `TableContainer` with columns for "Field Label", "Type", "Required", and "Status".

### Field Table Pattern

Use this structure to allow users to manage system and custom fields:

```jsx
<SettingItem>
  <Label content="Form Fields" help="Control which fields are visible, which are required, and manage custom fields." />
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
    <OptionsMenuRootButton
      icon={addIcon}
      options={[
        { text: "Add Text Input", type: "onClick", onClick: () => handleAddField("text") },
        { text: "Add Checkbox", type: "onClick", onClick: () => handleAddField("checkbox") },
      ]}
    />
  </div>

  <TableContainer
    emptyMessage="No fields."
    columns={[
      { content: "Field Label" },
      { content: "Type" },
      { content: "Required", compact: true },
      { content: "Status" },
      { content: "", compact: true },
    ]}
    rows={ensureSystemFields(state.fields).map((f, i) => {
      const canMoveUp = i > 0 && !f.isSystem && !ensureSystemFields(state.fields)[i - 1]?.isSystem;
      const canMoveDown = i < ensureSystemFields(state.fields).length - 1 && !f.isSystem && !ensureSystemFields(state.fields)[i + 1]?.isSystem;

      return [
        <div key={`${f.id}-lbl`} style={{ fontSize: 13, display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 500, opacity: f.enabled ? 1 : 0.5 }}>{f.label}</span>
          {f.isSystem && <span style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>System</span>}
        </div>,
        <div key={`${f.id}-type`} style={{ minWidth: 80, display: "inline-flex", justifyContent: "flex-start" }}>
          <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", background: "#f1f5f9", padding: "4px 10px", borderRadius: 4, border: "1px solid #e2e8f0", fontWeight: 600 }}>{f.type}</span>
        </div>,
        <div key={`${f.id}-req-wrap`} style={{ display: "flex", justifyContent: "center" }}>
          <Checkbox key={`${f.id}-req`} value={!!f.required} onChange={checked => updateField(f.id, "required", checked)} />
        </div>,
        <div
          key={`${f.id}-status`}
          onClick={() => updateField(f.id, "enabled", !f.enabled)}
          style={{
            cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "4px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, minWidth: 90,
            backgroundColor: f.enabled ? "#dcfce7" : "#f1f5f9", color: f.enabled ? "#166534" : "#64748b",
            transition: "all 0.2s", border: `1px solid ${f.enabled ? "#bbf7d0" : "#e2e8f0"}`, userSelect: "none"
          }}
        >
          {f.enabled ? "Active" : "Disabled"}
        </div>,
        <OptionsMenuRootButton
          key={`${f.id}-actions`}
          options={[
            { text: "Edit Field", icon: editIcon, type: "onClick", onClick: () => { setEditingFieldId(f.id); setLeadFormFieldDrawerOpen(true); } },
            { text: f.isSystem ? "Cannot delete system field" : "Delete Field", icon: deleteIcon, type: "onClick", onClick: () => !f.isSystem && handleDeleteField(i) },
            { text: "Move Up", icon: arrowUpIcon, type: "onClick", onClick: () => canMoveUp && handleMoveField(i, i - 1), disabled: !canMoveUp },
            { text: "Move Down", icon: arrowDownIcon, type: "onClick", onClick: () => canMoveDown && handleMoveField(i, i + 1), disabled: !canMoveDown },
          ]}
        />,
      ];
    })}
  />
</SettingItem>
```

- **Skip Logic:** `allowSkip` (Checkbox) and `leadFormSkipButtonText` (TextInput).

### Field Edit Drawer

Use a `Drawer` and a separate `LeadFormFieldDrawer` sub-component to edit field details (Label, Placeholder, Default Value, etc.).

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
