---
applyTo: "**"
---

# AI Code Generation Instructions

The following instructions are to be used by AI code generation tools to create Dot.vu components. In this agentic context, the AI is expected to modify the project files directly based on these instructions. Do not output the files as explained bellow. Instead edit the files in place.

- common.js
- editor.js
- live.js

## 📄 **LLM Prompt: Generate Dot.vu Component Structure**

You are a Developer/Design/UX Expert that generates a **full Dot.vu component ** as a _files manifest with fenced code blocks_.
The component must include exactly **three files**:

1. `/common/index.js` — initial state and shared logic.
2. `/editor/index.js` — editor settings, actions, triggers, and metadata.
3. `/live/index.js` — live rendering logic, styles, and action handlers.

You are focused on creating a polished, production-ready product with excellent usability.

Your output will be parsed automatically — **follow the format exactly**.

**CRITICAL: You MUST ALWAYS return ALL THREE files, even when modifying existing code. Never return partial responses or incomplete file sets.**

---

## 📦 **Output Format**

````
FILE: /common/index.js
```js
<file content here>
```
END

FILE: /editor/index.js
```js
<file content here>
```
END

FILE: /live/index.js
```js
<file content here>
```
END
````

**Rules:**

1. Output **exactly three files** — `/common/index.js`, `/editor/index.js`, `/live/index.js` — in that order.
2. Immediately after `FILE: ...`, open a fenced code block with the correct language tag (`js`).
3. Close the fenced block with three backticks ``` on its own line.
4. After the fence, put `END` on its own line.
5. No extra prose, JSON wrappers, comments, or explanations outside code blocks.

### Features to define for each component

- **Text inputs:** Allow text properties to be edited using TextInput components.
- **Number inputs:** Allow numeric properties to be edited using NumberInput components.
- **Fonts:** Support one or more fonts that can be chosen visually.
- **Colors:** Support color pickers for styling text, buttons, or backgrounds.
- **Actions:** Define executable logic on the component (e.g., update text or colors).
- **Triggers:** Events that can be fired (e.g., button clicked, image clicked).
- **Data fields:** Define inputs/outputs (e.g., title text, button labels).
- **Audience fields:** Track user interactions and behavior data that can be stored in audience profiles.
- **Help articles:** Provide contextual help and documentation for settings panels.
- **Size types:** Control whether width/height is resizable or content-based.
  If using resizable height ensure the root element is set to `height: 100%`
- **Initial state:** Define default state values in `common/index.js`.
- **React Component (live):** Implement rendering logic, style, and action handlers.

### Core Constraints and Best Practices

- Use `<Tabs>` or `<Section>` as the root element for settings.
- When a component has both Content and Style tabs, organize **both** tabs using the same named sections in the same order. Content-specific controls go in their respective section on the Content tab; style-specific controls go in the matching section on the Style tab. Add shared or global controls only after the section-specific groups in both tabs. For example: `Start`, `Questions`, `Results`, then `Shared`; or `Header`, `Items`, then `Shared`.
- **MANDATORY**: Always wrap label and input pairs with `<SettingItem>` components.
- **MANDATORY**: For `<Button>` components, the `style` property is required.
- **MANDATORY**: Include help articles for settings panels to provide contextual documentation.
- Include text inputs, number inputs, fonts, colors, actions, triggers, and settings.
- Use `TextInput` for text properties and `NumberInput` for numeric properties.
- Font sizes in **px**.
- Never use maxWidth or fixed layout constraints. The editor’s container width and height always define the component’s boundaries.
- Master-detail pattern must be used for any dynamic lists or collections of items. Use `TableContainer` for listing items and `Drawer` for editing item details. You can have multiple `Drawer`s nested if needed.
- Do not use Audience Data unless explictly specified.
- **MANDATORY**: Use box-sizing: border-box for all elements to ensure padding and borders are included in total dimensions.
- Use https://placehold.co/{width}x{height} for placeholder/default images.
- Use getUniqueId() from '@utils' for generating unique IDs. You should always use unique IDs for dynmamic elements (arrays, lists, etc). (Example: `import { getUniqueId } from '@utils'`)
- **MANDATORY**: Always use `<ScopedStyle>` component instead of regular `<style>` tags for styling. Import it from '@utils': `import { ScopedStyle } from '@utils'`. This ensures proper CSS scoping and prevents style conflicts between components.
- **MANDATORY**: When updating existing components, always replace any `<style>` tags with `<ScopedStyle>` components to ensure proper CSS scoping and prevent style conflicts.
- Triggers are for external event notification only. Component behavior changes must be implemented via `setState` and component logic, NOT in trigger handlers.
- **MANDATORY**: Only use dynamic values if explicitly specified. Using <DynamicValueInput> or dynamic value resolution when not required adds unnecessary complexity and performance overhead.
- Always generate good default data for the state in `getInitialState`. This ensures the component is usable out of the box and provides a good user experience.
- You cannot use any other dependencies or libraries
- **MANDATORY**: Always use the `useScaler` hook from '@hooks' for responsive scaling in live components. Import it with `import { useScaler } from '@hooks'` and use the `s()` function for ALL size-related values. Anything that changes the shape, spacing, text, or placement must scale. This ensures proper scaling across different container sizes and resolutions. You MUST use the `s()` function for ALL size-related values, including pixels, font-size, margins, paddings, borders, CSS styles, inline styles, logic, media queries, etc. Line-height MUST be scaled if it uses pixel values, but for unitless values, use the unitless value directly (e.g., `line-height: 1.5`).

### 🎯 **useScaler Hook for Responsive Scaling**

The `useScaler` hook provides automatic responsive scaling for live components. It MUST be used for all size-related values to ensure proper scaling across different container sizes and resolutions.

**Import and Usage:**

```javascript
import { useScaler } from '@hooks'

export function Component({ state, setState, saveAudienceData, runTrigger }) {
  const { s, scale } = useScaler()

  const styles = `
    .container {
      padding: ${s(20)}px;
      margin: ${s(10)}px ${s(15)}px;
      font-size: ${s(16)}px;
      line-height: 1.5;
      border-radius: ${s(8)}px;
      border-width: ${s(1)}px;
    }

    @media (max-width: ${s(600)}px) {
      .container {
        padding: ${s(10)}px;
        font-size: ${s(14)}px;
      }
    }
  `

  return (
    <div style={{ fontSize: `${s(18)}px`, lineHeight: 1.5) }}>
      Scaled content
    </div>
  )
}
```

### 🧩 **Container Sizing Compliance Rule (Improved)**

**Container Adaptation:**
Components must always adapt to the container’s dynamic width and height.
When a dimension is marked as `SizeType.RESIZABLE`, **the editor-defined container width and height are the single source of truth** — all internal elements must fit and scale within those bounds.
Do **not** use `maxWidth`, `minWidth`, or fixed pixel widths to limit, cap, or override the container’s dimensions — these break resizable behavior.
If you would normally use `maxWidth` for centering, **use `width: "90%"` and `margin: "0 auto"` instead**.
Always use a `ResizeObserver` to handle runtime resizing due to responsiveness or layout updates.

---

**Width & Layout Behavior:**

- The root element must use `width: 100%` and respect the container’s width exactly.
- Use `height: 100%` only when `SizeType.RESIZABLE` is applied to height.
- Internal layouts (e.g., cards, sections, panels) must be centered or spaced using **flex alignment, grid layout, or margins — never `maxWidth` or fixed pixel widths.**
- Inner elements can use **percentage-based widths** (e.g., `width: "90%"`) to create margins or breathing room but must never restrict or exceed the container’s full width.
- The component must expand and shrink fluidly with the container, maintaining proper alignment without overflow or empty gaps on any side.
- The editor’s **width setting is absolute and overrides all internal layout intentions.**

---

**Padding & Box Model Behavior:**

- **MANDATORY**: Always apply `box-sizing: border-box` to the root and any major containers so padding and borders are included within total dimensions.
- Padding must never push content outside the container.
- If padding causes overflow, reduce padding or adjust layout rather than changing container width.
- When horizontal padding exists, ensure child elements remain visible (e.g., via `overflow: hidden` or `width: "calc(100% - 2 * padding)"`).
- Avoid mixing fixed padding and percentage widths if it risks exceeding the parent width.

---

**Height Behavior:**

- Use **`height: SizeType.RESIZABLE`** when the component’s purpose is to fill a defined space — e.g., carousels, galleries, videos, maps, visual blocks, or framed panels.
- Use **`height: SizeType.CONTENT_BASED`** when the component’s height is determined by its content — e.g., quizzes, surveys, forms, text sections, or personality tests.
- **Never use `RESIZABLE`** for text-based or form-based layouts that flow vertically; their height must grow naturally with content.
- Components with **fixed aspect ratios** should use `SizeType.CONTENT_BASED` to preserve visual proportions and prevent distortion when resized.

---

**General Principles:**

- The container’s width and height from the editor are **non-negotiable**; all components must conform to them exactly.
- Components must render correctly at **any container size**, without breaking layout, clipping content, or leaving unused space.
- **Do not use `maxWidth`, `minWidth`, or fixed pixel dimensions.**
- **Do not use overflow caused by padding or box shadows.**
- If you need centering, **use margins or flex alignment, never hard size limits.**

---

💡 **Implementation Hint for Code Generators:**

> When you would normally write `maxWidth: 500`, replace it with `width: "90%"` and `margin: "0 auto"`.
> Always start your root container with:
> `style={{ width: "100%", boxSizing: "border-box" }}`.

---

## API Guide with annotations

### `common/index.js`

```jsx
// getInitialState is used to get the initial state of the data.
// It receives the current state and returns the state to use.
// This is very usefull when creating new properties.
export function getInitialState(state) {
  return {
    title: "Default Title",
    description: "Default description text.",
    buttonText: "Click Me",
    ...state,
  };
}
```

### `editor/index.js`

```jsx
import React from "react";
import {
  TextInput,
  NumberInput,
  Tabs,
  Tab,
  Section,
  SettingItem,
  Label,
  TableContainer,
  OptionsMenuRootButton,
  DynamicValueInput,
} from "@ui";
import { SizeType } from "@constants";
import { createDynamicValue } from "@data";
import { getInitialState } from "@common/index";
export { getInitialState };

/**
 * This component is used to define the settings for the component.
 * It allows users to configure the component properties such as title, description, and other settings.
 *
 * @template T - The type of the state object.
 * @param {Object} props - The component properties.
 * @param {T} props.state - The current state of the component as defined in the getInitialState function.
 * @param {React.Dispatch<React.SetStateAction<T>>} props.setState - Function to update the component state.
 * @returns {JSX.Element} The rendered settings component
 *
 */
function Settings({ state, setState }) {
  return (
    <Tabs defaultActiveTab="content">
      <Tab id="content" title="Content">
        <Section>
          <SettingItem>
            <Label content="Title" />
            <TextInput
              value={state.title}
              onChange={(e) =>
                setState({ ...state, title: e.currentTarget.value })
              }
            />
          </SettingItem>
          <SettingItem>
            <Label content="Description" />
            <TextInput
              value={state.description}
              onChange={(e) =>
                setState({ ...state, description: e.currentTarget.value })
              }
            />
          </SettingItem>
          <SettingItem>
            <Label content="Button Text" />
            <TextInput
              value={state.buttonText}
              onChange={(e) =>
                setState({ ...state, buttonText: e.currentTarget.value })
              }
            />
          </SettingItem>
        </Section>
      </Tab>
    </Tabs>
  );
}

// getSettings function is used to define the settings for the component.
// It returns an object with the settings name, component, width, and optional help article.

/**
 * @typedef {Object} SettingsHelp
 * @property {string} title - The title of the help article.
 * @property {JSX.Element} content - The content of the help article.

/**
 * @template T - The type of the state object as defined in getInitialState.
 * @typedef {Object} SettingDeclaration
 * @property {string} name - The name of the settings panel.
 * @property {ReactComponent} Setting - The React component to render for the settings.
 * @property {number} width - The width of the settings panel in pixels.
 * @property {(state: T) => SettingHelp} [help] - Optional function to provide help content for the settings.
 */

/**
 * @template T - The type of the state object.
 * @param {Object} state - The current state of the component as defined in the getInitialState function.
 * @returns {Record<string, SettingDeclaration>} An object containing the settings for the component.
 */
export function getSettings(state) {
  return {
    settings: {
      name: "Settings",
      Setting: Settings,
      width: 450,
      help: (state) => ({
        title: "Component Settings Help",
        content: (
          <>
            <h1>Component Settings</h1>
            <p>
              These settings allow you to configure the component. You can
              adjust the title, description, and other properties to customize
              the component experience for your users.
            </p>
            <p>
              Use the settings below to modify the component behavior and
              appearance.
            </p>
          </>
        ),
      }),
    },
  };
}

/**
 * @typedef {Object} DataField
 * @property {string} name - The name of the data field.
 * @property {'text'|'number'|'boolean'|'list'|'text$$image'|'text$$color'} type - The type of the data field. 'list' represents an array of string.
 * @property {boolean} [audience] - Whether the field is stored in audience data.
 */

/**
 * This function defines the data fields for the component.
 * It returns an object where each key is the fieldId as defined in the state,
 * and the value is an object containing the field name, type, and optional audience flag.
 * This is used to define the data that can be accessed from the component.
 *
 * @template T - The type of the state object.
 * @param {T} state - The current state of the component as defined in the getInitialState function.
 * @returns {Record<string, DataField>} An object containing the data fields for the component. The key is the fieldId as defined in T.
 */
export function getDataFields(state) {
  return {
    title: { name: "Title", type: "text" },
    buttonClicked: {
      name: "Button Clicked",
      type: "boolean",
      audience: true,
    },
  };
}

/**
 * @template T - The type of the state object.
 * @template A - The type of the action state.
 * @typedef {Function} ActionSetting
 * @property {T} componentState - The current state of the component as defined in the getInitialState function.
 * @property {A} actionState - The current state of the action.
 * @property {(newActionState: A) => void} setActionState - Function to update the action state.
 * @returns {JSX.Element} The rendered settings component for the action.

/**
 * @typedef {Object} ActionInfo
 * @property {string} text - The description of the action.
 */

/**
 * @typedef {Object} ActionDeclaration
 * @property {string} name - The name of the action.
 * @property {ActionInfo} info - The information about the action.
 * @property {Object} state - The action state that will be used when the action is executed.
 * @property {ActionSetting} Setting - The React component to render for the action settings.
 */

/**
 * This function defines the actions for the component.
 * It returns an object where each key is the action name,
 * and the value is an object containing the action name, info, state, and settings component.
 * This is used to define the actions that can be executed on the component.
 *
 * Each action defined here must have a corresponding handler in the `getActionHandlers` function.
 *
 * @template T - The type of the state object.
 * @param {T} state - The current state of the component as defined in the getInitialState function.
 * @returns {Record<string, ActionDeclaration>} An object containing the actions for the component.
 */
export function getActions(state) {
  return {
    updateTitle: {
      name: "Update Title",
      info: { text: "Updates the title text" },
      state: { title: createDynamicValue("text", "New title") },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Title" />
            <DynamicValueInput
              value={actionState.title}
              onChange={(newValue) =>
                setActionState({ ...actionState, title: newValue })
              }
            />
          </SettingItem>
        );
      },
    },
  };
}

/**
 * @typedef {Object} Trigger
 * @property {string} name - The name of the trigger.
 */

/**
 * This function defines the triggers for the component.
 * It returns an object where each key is the trigger name,
 * and the value is an object containing the trigger name and display name.
 *
 * Triggers are used to define events that can be fired from the component.
 * For example, a button click can trigger an event that can be handled in the live component.
 * Triggers can be fired using the `runTrigger` function in the live component.
 *
 * @template T - The type of the state object.
 * @param {T} state - The current state of the component as defined in the getInitialState function.
 * @returns {Record<string, Trigger>} An object containing the triggers for the component.
 */
export function getTriggers(state) {
  return {
    onButtonClick: { name: "On Button Click" },
    onImageClick: { name: "On Image Click" },
  };
}

/**
 * This function returns the fonts used in the component.
 * It receives the current state of the component and returns an array of font names.
 * This is used to ensure that the component uses the correct fonts for rendering. This is mandatory for * the component to work correctly.
 *
 * @template T - The type of the state object.
 * @param {T} state - The current state of the component as defined in the getInitialState function.
 * @returns {string[]} An array of font names used in the component.
 */
export function getFonts(state) {
  return [state.font];
}

/**
 * @typedef {SizeType.RESIZABLE | SizeType.CONTENT_BASED} SizeType
 */

/**
 * @typedef {Object} SizeTypeReturn
 * @property {SizeType} width - The size type for width, can be resizable' or content-based.
 * @property {SizeType} height - The size type for height, can be 'resizable' or content-based.
 */

/**
 * This function defines how the component should behave when the user resizes it in the editor.
 * It determines whether the width and height should scale with the container or depend on content.
 *
 * ### Guidelines
 * - **Width behavior:**
 *  - For most components (cards, banners, layouts), use `width: SizeType.RESIZABLE` — they should expand to fit the container.
 *  - For small or inline components (buttons, icons, badges, chips, labels), use `width: SizeType.CONTENT_BASED` — their width should fit their content naturally.
 *  - Use your design judgment: if the component’s visual identity depends on its content size (like text length), prefer `CONTENT_BASED`.

 * - For **height**, choose carefully:
 *   - Use **`SizeType.RESIZABLE`** for visual components that should scale or fill their container
 *     (e.g., image carousels, galleries, videos, charts, or visual layouts).
 *   - Use **`SizeType.CONTENT_BASED`** for text-driven or vertically flowing components
 *     (e.g., quizzes, forms, surveys, personality tests, or articles) where height depends on content.
 *   - For fixed aspect ratios, prefer **content-based height** to maintain proportion.
 *
 * Components must render correctly at any editor-defined width or height, and should use
 * `ResizeObserver` in the live component to adapt dynamically to container size changes.
 *
 * @template T
 * @param {T} state - The current state of the component as defined in getInitialState.
 * @returns {{ width: SizeType, height: SizeType }} The width and height size types.
 */
export function getSizeTypes(state) {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.CONTENT_BASED,
  };
}

// getLiveState function is used to get the live state of the component.
// It receives the current state (in the editor) and returns the state to use for rendering (live).
// This is useful for these cases:
// - When some settings/state are not needed in the live state.
// - When some settings/state should be private and not exposed in the live state.

/**
 * This function defines the live state of the component.
 * It receives the current state of the component and returns the state to use for rendering.
 * This is useful for cases where some settings/state are not needed in the live state,
 * or when some settings/state should be private and not exposed in the live state.
 * The live state is used to render the component in the live view.
 *
 * The return value is the state object that will be used for rendering the component in the Live Component.
 *
 * @template T - The type of the state object.
 * @param {T} state - The current state of the component as defined in the getInitialState function.
 * @returns {Object} The live state of the component to be used for rendering.
 */
export function getLiveState(state) {
  return state;
}
```

### `live/index.js`

```jsx
import React from "react";
import { resolveDynamicValue } from "@data";
import { ScopedStyle } from "@utils";
import { useScaler } from "@hooks";
import { getInitialState } from "@common/index";
export { getInitialState };

// getActionHandlers function defines the action handlers for the component.
// It returns an object with the action names and their handlers.
// Action handlers are used to define the logic that will be executed when an action is triggered.
// This function must return an object with the actionNames as defined in getActions.

/**
 * @template T - The type of the state object as defined in getInitialState.
 * @typedef {Function} ActionHandler
 * @property {Object} actionState - The state of the action.
 * @property {React.Dispatch<React.SetStateAction<T>>} setComponentState - Function to update the component state.
 * @param {T} componentState - The current state of the component as defined in the getInitialState function.
 */

/**
 * This function defines the action handlers for the component as they are defined in getActions.
 * It returns an object where each key is the action id as defined in getActions.
 *
 * Each action handler is a function that receives the action state and a function to update the
 * component state.
 *
 * @template T - The type of the state object.
 * @returns {Record<string, ActionHandler>} An object containing the action handlers for the component.
 */
export function getActionHandlers() {
  return {
    async updateTitle({ actionState, setComponentState, componentState }) {
      const newTitle = await resolveDynamicValue(actionState.title);
      setComponentState((prev) => ({ ...prev, title: newTitle }));
    },
  };
}

// Component function is the main rendering function for the component.
// It receives the current state, a function to run triggers, and uses the useScaler hook for responsive design.
// It receives a setState function to update the state of the component.
// It receives a saveAudienceData function to save audience field values to user profiles.
// The useScaler hook provides the s() function to automatically scale size values (pixels, line-height, font-size, etc.) based on the component's container size.
// The runTrigger function is used to trigger events defined in getTriggers.
// The saveAudienceData function receives an array of property names to save to audience data.
// The component should return a valid React element that represents the UI of the component.
// The state object contains all the values defined in the editor.

/**
 * @template T - The type of the state object.
 * @param {Object} props - The component properties.
 * @param {T} props.state - The current state of the component as defined in the getInitialState function.
 * @param {React.Dispatch<React.SetStateAction<T>>} props.setState - Function to update the component state.
 * @param {(properties: string[]) => void} props.saveAudienceData - Function to save audience data.
 * @param {(triggerName: string) => void} props.runTrigger - Function to fire external events defined in getTriggers.
 * @returns {JSX.Element} The rendered component.
 */
export function Component({ state, setState, saveAudienceData, runTrigger }) {
  const { s } = useScaler();
  // Handle button click - implement actual logic here, not in runTrigger
  const handleButtonClick = () => {
    // 1. Update component state (actual component behavior)
    setState((prev) => ({ ...prev, clicked: true }));

    // 2. Save audience data if needed
    saveAudienceData(["clicked"]);

    // 3. Fire trigger for external listeners
    runTrigger("onButtonClick");
  };

  const styles = `
    .container {
      box-sizing: border-box;
      padding: ${s(20)}px;
      background-color: #f5f5f5;
    }
    .title {
      font-family: ${state.font};
      font-size: ${s(18)}px;
      line-height: ${s(1.2)};
      margin: 0 0 ${s(10)}px 0;
    }
    .description {
      font-family: ${state.font};
      font-size: ${s(14)}px;
      margin: 0 0 ${s(15)}px 0;
    }
    .button {
      border: none;
      padding: ${s(10)}px ${s(20)}px;
      font-size: ${s(14)}px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border-radius: ${s(4)}px;
      border-width: ${s(1)}px;
    }
  `;

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div className="container">
        <h3 className="title">{state.title}</h3>
        <p className="description">{state.description}</p>
        <button className="button" onClick={handleButtonClick}>
          {state.buttonText}
        </button>
      </div>
    </>
  );
}
```

## 💡 **Reference examples**

### Example 1: Simple Card with Image, Button, and Colors

````
FILE: /common/index.js
```js
export function getInitialState(state) {
  return {
    title: 'Default Title',
    description: 'Default description text.',
    imageUrl: 'https://via.placeholder.com/400x200',
    buttonText: 'Click Me',
    color1: '#ffffff',
    color2: '#000000',
    font: 'Arial',
    ...state,
  }
}
```
END

FILE: /editor/index.js
```jsx
import React from "react";
import { TextInput, FontSelector, ImagePicker, ColorPicker, Tabs, Tab, Section, SectionHeading, SettingItem, Label, DynamicValueInput } from "@ui";
import { SizeType } from '@constants';
import { createDynamicValue } from '@data'
import { getInitialState } from '@common/index';
export { getInitialState };

function Settings({ state, setState }) {
  return (
    <Tabs defaultActiveTab="content">
      <Tab id="content" title="Content">
        <Section>
          <SectionHeading>Image</SectionHeading>
          <SettingItem>
            <Label content="Image" />
            <ImagePicker
              value={state.imageUrl}
              onChange={(imageUrl) => setState({ ...state, imageUrl })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Title</SectionHeading>
          <SettingItem>
            <Label content="Title" />
            <TextInput
              value={state.title}
              onChange={(e) => setState({ ...state, title: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Description</SectionHeading>
          <SettingItem>
            <Label content="Description" />
            <TextInput
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Button</SectionHeading>
          <SettingItem>
            <Label content="Button Text" />
            <TextInput
              value={state.buttonText}
              onChange={(e) => setState({ ...state, buttonText: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
      </Tab>
      <Tab id="style" title="Style">
        <Section>
          <SectionHeading>Title</SectionHeading>
          <SettingItem>
            <Label content="Font" />
            <FontSelector
              value={state.font}
              onChange={(font) => setState({ ...state, font })}
            />
          </SettingItem>
          <SettingItem>
            <Label content="Text Color" />
            <ColorPicker
              value={state.color1}
              onChange={(color1) => setState({ ...state, color1 })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Button</SectionHeading>
          <SettingItem>
            <Label content="Button Color" />
            <ColorPicker
              value={state.color2}
              onChange={(color2) => setState({ ...state, color2 })}
            />
          </SettingItem>
        </Section>
      </Tab>
    </Tabs>
  );
}

export function getSettings(state) {
  return {
    settings: {
      name: "Card Settings",
      Setting: Settings,
      width: 800,
      help: (state) => ({
        title: 'Card Component Help',
        content: (
          <>
            <h1>Card Component Settings</h1>
            <p>Configure your card component with title, description, image, and button settings. This card component is perfect for displaying content in a visually appealing format.</p>

            <h2>Content Tab</h2>
            <p>Use the Content tab to set the main text content and image for your card.</p>

            <h2>Button Tab</h2>
            <p>Customize the button text that appears on your card.</p>

            <h2>Style Tab</h2>
            <p>Choose fonts and colors to match your design requirements.</p>

            <h2>Data Fields</h2>
            <ul>
              <li><b>Title</b> – Stores the current card title (text).</li>
              <li><b>Button Text</b> – Stores the button label (text).</li>
              <li><b>Button Clicked</b> – Tracks if the button has been clicked (boolean, can be used for audience targeting).</li>
              <li><b>Image Clicked</b> – Tracks if the image has been clicked (boolean, can be used for audience targeting).</li>
            </ul>

            <h2>Actions</h2>
            <ul>
              <li><b>Update Title</b> – Changes the title text dynamically. Useful for personalization or conditional updates.</li>
            </ul>

            <h2>Triggers</h2>
            <ul>
              <li><b>On Button Click</b> – Fires when the card’s button is pressed. Attach custom actions here (e.g., navigate, update data).</li>
              <li><b>On Image Click</b> – Fires when the image is clicked. Can be used for tracking engagement or triggering other actions.</li>
            </ul>
          </>
        )
      })
    }
  }
}


export function getDataFields(state) {
  return {
    title: { name: 'Title', type: 'text', value: true },
    buttonText: { name: 'Button Text', type: 'text', value: true },
    buttonClicked: { name: 'Button Clicked', type: 'boolean', value: false, audience: true },
    imageClicked: { name: 'Image Clicked', type: 'boolean', value: false, audience: true }
  }
}

export function getActions(state) {
  return {
    updateTitle: {
      name: 'Update Title',
      info: { text: 'Updates the title text' },
      state: { title: createDynamicValue('text', 'New title') },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Title" />
            <DynamicValueInput
              value={actionState.title}
              onChange={title => setActionState({ ...actionState, title })}
            />
          </SettingItem>
        )
      }
    }
  }
}

export function getTriggers(state) {
  return {
    onButtonClick: { name: 'On Button Click' },
    onImageClick: { name: 'On Image Click' }
  }
}

export function getFonts(state) {
  return [state.font]
}

export function getSizeTypes(state) {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.CONTENT_BASED,
  }
}
```
END

FILE: /live/index.js
```jsx
import React from 'react';
import { resolveDynamicValue } from '@data'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index';
export { getInitialState };

export function getActionHandlers() {
  return {
    async updateTitle({ actionState, setComponentState, componentState }) {
      const newTitle = await resolveDynamicValue(actionState.title, componentState)
      setComponentState(prev => ({ ...prev, title: String(newTitle || '') }))
    },
  }
}

export function Component({ state, setState, saveAudienceData, runTrigger }) {
  const { s } = useScaler()

  const styles = `
    .card-container {
      width: 100%;
      padding: ${s(16)}px;
      box-sizing: border-box;
    }
    .card-image {
      width: 100%;
      height: auto;
      cursor: pointer;
      border-radius: ${s(8)}px;
    }
    .card-title {
      margin: ${s(12)}px 0 ${s(8)}px 0;
      font-weight: 600;
    }
    .card-description {
      margin: 0 0 ${s(16)}px 0;
      line-height: 1.5;
    }
    .card-button {
      border: none;
      padding: ${s(10)}px ${s(20)}px;
      font-size: ${s(14)}px;
      cursor: pointer;
      border-radius: ${s(6)}px;
      transition: opacity 0.2s ease;
    }
    .card-button:hover {
      opacity: 0.9;
    }
  `

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div className="card-container">
        <img
          src={state.imageUrl}
          alt="Card"
          className="card-image"
          onClick={() => {
            runTrigger('onImageClick');
            setState({ ...state, imageClicked: true });
            saveAudienceData(['imageClicked']);
          }}
        />
        <h3
          className="card-title"
          style={{
            fontFamily: state.font,
            fontSize: `${s(18)}px`,
            lineHeight: s(24),
            color: state.color1
          }}
        >
          {state.title}
        </h3>
        <p
          className="card-description"
          style={{
            fontFamily: state.font,
            fontSize: `${s(14)}px`,
            lineHeight: s(20),
            color: state.color2
          }}
        >
          {state.description}
        </p>
        <button
          className="card-button"
          style={{
            backgroundColor: state.color2,
            color: state.color1,
          }}
          onClick={() => {
            runTrigger('onButtonClick');
            setState({ ...state, buttonClicked: true });
            saveAudienceData(['buttonClicked']);
          }}
        >
          {state.buttonText}
        </button>
      </div>
    </>
  )
}
```
END
````

---

### Example 2: Simple Hero Banner with Background, CTA, and Colors

````
FILE: /common/index.js
```js
export function getInitialState(state) {
  return {
    headline: 'Your Big Headline',
    subtext: 'Supporting subtext here.',
    buttonText: 'Get Started',
    backgroundImage: 'https://via.placeholder.com/1200x400',
    color1: '#ffffff',
    color2: '#ff5722',
    font: 'Helvetica',
    ctaButtonClicked: false,
    ...state,
  }
}
```
END

FILE: /editor/index.js
```jsx
import React from "react";
import { TextInput, FontSelector, ImagePicker, ColorPicker, Tabs, Tab, Section, SettingItem, Label, DynamicValueInput } from "@ui";
import { SizeType } from '@constants';
import { createDynamicValue } from '@data'
import { getInitialState } from '@common/index';
export { getInitialState };

function Settings({ state, setState }) {
  return (
    <Tabs defaultActiveTab="content">
      <Tab id="content" title="Content">
        <Section>
          <SectionHeading>Image</SectionHeading>
          <SettingItem>
            <Label content="Background Image" />
            <ImagePicker
              value={state.backgroundImage}
              onChange={(backgroundImage) => setState({ ...state, backgroundImage })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Title</SectionHeading>
          <SettingItem>
            <Label content="Headline" />
            <TextInput
              value={state.headline}
              onChange={(e) => setState({ ...state, headline: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Description</SectionHeading>
          <SettingItem>
            <Label content="Subtext" />
            <TextInput
              value={state.subtext}
              onChange={(e) => setState({ ...state, subtext: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Button</SectionHeading>
          <SettingItem>
            <Label content="Button Text" />
            <TextInput
              value={state.buttonText}
              onChange={(e) => setState({ ...state, buttonText: e.currentTarget.value })}
            />
          </SettingItem>
        </Section>
      </Tab>
      <Tab id="style" title="Style">
        <Section>
          <SectionHeading>Title</SectionHeading>
          <SettingItem>
            <Label content="Font" />
            <FontSelector
              value={state.font}
              onChange={(font) => setState({ ...state, font })}
            />
          </SettingItem>
          <SettingItem>
            <Label content="Text Color" />
            <ColorPicker
              value={state.color1}
              onChange={(color1) => setState({ ...state, color1 })}
            />
          </SettingItem>
        </Section>
        <Section>
          <SectionHeading>Button</SectionHeading>
          <SettingItem>
            <Label content="Button Color" />
            <ColorPicker
              value={state.color2}
              onChange={(color2) => setState({ ...state, color2 })}
            />
          </SettingItem>
        </Section>
      </Tab>
    </Tabs>
  );
}

export function getSettings(state) {
  return {
    settings: {
      name: "Hero Banner Settings",
      Setting: Settings,
      width: 800,
      help: (state) => ({
        title: 'Hero Banner Help',
        content: (
          <>
            <h1>Hero Banner Component</h1>
            <p>Create impactful hero banners with headlines, supporting text, and call-to-action buttons. Perfect for landing pages and marketing content.</p>

            <h2>Content Configuration</h2>
            <p>Set your main headline, supporting subtext, button text, and background image to create compelling hero sections.</p>

            <h2>Styling Options</h2>
            <p>Choose appropriate fonts and colors that align with your brand identity. Text color should contrast well with your background image.</p>

            <h2>Best Practices</h2>
            <p>Keep headlines concise and impactful. Use high-quality background images that don't interfere with text readability.</p>

            <h2>Data Fields</h2>
            <ul>
              <li><b>Headline</b> – Stores the main headline text.</li>
              <li><b>Button Text</b> – Stores the CTA button label.</li>
            </ul>

            <h2>Actions</h2>
            <ul>
              <li><b>Update Headline</b> – Changes the headline text dynamically, useful for personalization or real-time updates.</li>
            </ul>

            <h2>Triggers</h2>
            <ul>
              <li><b>On CTA Button Click</b> – Fires whenever the call-to-action button is pressed. Attach custom actions here, such as navigation, form submission, or analytics tracking.</li>
            </ul>
          </>
        )
      })
    }
  }
}


export function getDataFields(state) {
  return {
    headline: { name: 'Headline', type: 'text', value: true },
    buttonText: { name: 'Button Text', type: 'text', value: true }
  }
}

export function getActions(state) {
  return {
    updateHeadline: {
      name: 'Update Headline',
      info: { text: 'Changes the headline text' },
      state: { headline: createDynamicValue('text', 'New headline') },
      Setting({ actionState, setActionState }) {
        return (
          <SettingItem>
            <Label content="Headline" />
            <DynamicValueInput
              value={actionState.headline}
              onChange={(headline) => setActionState({ ...actionState, headline })}
            />
          </SettingItem>
        )
      }
    }
  }
}

export function getTriggers(state) {
  return {
    onCTAButtonClick: { name: 'On CTA Button Click' }
  }
}

export function getFonts(state) {
  return [state.font]
}

export function getSizeTypes(state) {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.CONTENT_BASED,
  }
}
```
END

FILE: /live/index.js
```jsx
import React from 'react';
import { resolveDynamicValue } from '@data'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index';
export { getInitialState };

export function getActionHandlers() {
  return {
    async updateHeadline({ actionState, setComponentState, componentState }) {
      const newHeadline = await resolveDynamicValue(actionState.headline, componentState)
      setComponentState(prev => ({ ...prev, headline: newHeadline }))
    },
  }
}

export function Component({ state, runTrigger }) {
  const { s } = useScaler()
  const styles = `
    .hero-container {
      width: 100%;
      background-size: cover;
      background-position: center;
      padding: ${s(60)}px ${s(20)}px;
      text-align: center;
      position: relative;
    }
    .hero-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
    }
    .hero-headline {
      margin: 0 0 ${s(16)}px 0;
      font-weight: 700;
      text-shadow: ${s(2)}px ${s(2)}px ${s(4)}px rgba(0, 0, 0, 0.5);
    }
    .hero-subtext {
      margin: 0 0 ${s(30)}px 0;
      line-height: 1.4;
      text-shadow: ${s(1)}px ${s(1)}px ${s(2)}px rgba(0, 0, 0, 0.5);
    }
    .hero-button {
      border: none;
      padding: ${s(14)}px ${s(28)}px;
      font-size: ${s(16)}px;
      cursor: pointer;
      border-radius: ${s(6)}px;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hero-button:hover {
      transform: translateY(-${s(2)}px);
      box-shadow: 0 ${s(4)}px ${s(12)}px rgba(0, 0, 0, 0.3);
    }
  `

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div
        className="hero-container"
        style={{
          backgroundImage: `url(${state.backgroundImage})`,
        }}
      >
        <div className="hero-content">
          <h1
            className="hero-headline"
            style={{
              fontFamily: state.font,
              fontSize: `${s(32)}px`,
              color: state.color1
            }}
          >
            {state.headline}
          </h1>
          <p
            className="hero-subtext"
            style={{
              fontFamily: state.font,
              fontSize: `${s(18)}px`,
              color: state.color1
            }}
          >
            {state.subtext}
          </p>
          <button
            className="hero-button"
            style={{
              backgroundColor: state.color2,
              color: state.color1,
            }}
            onClick={() => runTrigger('onCTAButtonClick')}
          >
            {state.buttonText}
          </button>
        </div>
      </div>
    </>
  )
}
```
END
````

## UI Components Documentation

This document provides comprehensive documentation for all UI components exported from the `ui.js` module. These components are designed to be used in the DOT editor settings interface and provide a consistent, reusable set of interface elements.

### Button

**Purpose**: A versatile button component with support for icons, text, and various styles.

**Main Properties**:

- `text` (string): Button text content
- `onClick` (function): Click event handler
- `style` (string): **MANDATORY** Button style variant: "primary", "secondary"
- `disabled` (boolean): Whether the button is disabled
- `selected` (boolean): Whether the button appears selected
- `title` (string): Tooltip text
  **Example**:

```javascript
<Button
  text="Save"
  icon="<svg>...</svg>"
  style="primary"
  onClick={() => console.log("Saved!")}
  title="Save the current changes"
/>
```

### Dropdown

**Purpose**: A dropdown/select component with customizable options and styling.

**Main Properties**:

- `value` (any): Currently selected value
- `onChange` (function): Callback when selection changes
- `options` (array): Array of option objects with `value`, `text`
- `placeholder` (object): Placeholder option object
- `disabled` (boolean): Whether the dropdown is disabled

**Example**:

```javascript
<SettingItem>
  <Label content="Select Option" />
  <Dropdown
    value="option1"
    options={[
      { value: "option1", text: "Option 1" },
      { value: "option2", text: "Option 2" },
    ]}
    onChange={(value) => console.log(value)}
    placeholder={{ text: "Select an option..." }}
  />
</SettingItem>
```

### ColorPicker

**Purpose**: A color picker component that integrates with the DOT editor's color selection system.

**Main Properties**:

- `value` (string): Current color value
- `onChange` (function): Callback when color changes

**Example**:

```javascript
<SettingItem>
  <Label content="Background Color" />
  <ColorPicker value="#ff0000" onChange={(color) => console.log(color)} />
</SettingItem>
```

### ImagePicker

**Purpose**: An image picker component for selecting and managing images with preview capabilities.

**Main Properties**:

- `value` (string): URL of the currently selected image
- `onChange` (function): Callback when image changes

**Example**:

```javascript
<SettingItem>
  <Label content="Image" />
  <ImagePicker
    value="https://example.com/image.jpg"
    onChange={(imageUrl) => console.log(imageUrl)}
  />
</SettingItem>
```

### NumberInput

**Purpose**: A numeric input component with validation and step controls.

**Main Properties**:

- `value` (number): Current numeric value
- `onChange` (function): Callback when value changes
- `description` (string): Description text below the input
- `placeholder` (string): Placeholder text
- `step` (number): Step increment for the input
- `min` (number): Minimum allowed value
- `max` (number): Maximum allowed value
- `className` (string): Additional CSS classes

**Example**:

```javascript
<SettingItem>
  <Label content="Font Size" />
  <NumberInput
    value={10}
    onChange={(value) => console.log(value)}
    description="Choose a font size between 8 and 72"
    min={8}
    max={72}
    step={1}
  />
</SettingItem>
```

### OptionsMenuRootButton

**Purpose**: A three-dots menu button component that displays a dropdown menu with actionable options. This is commonly used for row-level actions in tables like edit, delete, or other contextual operations.

**Main Properties**:

- `options` (array): Array of option objects defining menu items
  - `text` (string): Display text for the menu item
  - `tip` (string): Tooltip text for the menu item
  - `icon` (icon resource imported from @icons): Must be an imported icon variable (e.g., deleteIcon), not a string literal.
  - `type` (string): Action type, usually "onClick"
  - `onClick` (function): Click handler for the menu item
- `key` (string|number): React key prop for list rendering

**Example**:

```javascript
import { deleteIcon, editIcon } from "@icons";
<OptionsMenuRootButton
  key={index}
  options={[
    {
      text: "Edit",
      tip: "Edit this item",
      icon: editIcon,
      type: "onClick",
      onClick: () => handleEdit(item),
    },
    {
      text: "Delete",
      tip: "Delete this item",
      icon: deleteIcon,
      type: "onClick",
      onClick: () => handleDelete(item),
    },
  ]}
/>;
```

### FontSelector

**Purpose**: A font selection component that integrates with the DOT editor's font system.

**Main Properties**:

- `value` (string): Currently selected font family
- `onChange` (function): Callback when font changes

**Example**:

```javascript
<SettingItem>
  <Label content="Font Family" />
  <FontSelector value="Arial" onChange={(font) => console.log(font)} />
</SettingItem>
```

### TextInput

**Purpose**: A text input component with various configuration options and validation support.

**Main Properties**:

- `value` (string): Current text value
- `onChange` (function): Callback when text changes - receives React event, use `e.currentTarget.value` to get the value
- `placeholder` (string): Placeholder text
- `disabled` (boolean): Whether the input is disabled
- `title` (string): Tooltip text
  **Example**:

```javascript
<SettingItem>
  <Label content="Text Input" />
  <TextInput
    value="Hello World"
    onChange={(e) => console.log(e.currentTarget.value)}
    placeholder="Enter text here..."
  />
</SettingItem>
```

### Checkbox

**Purpose**: A checkbox input component with label and description support.

**Main Properties**:

- `value` (boolean): Current checked state
- `onChange` (function): Callback when checked state changes
- `label` (string): Label text for the checkbox
- `description` (string): Description text above the checkbox

**Example**:

```javascript
<SettingItem>
  <Checkbox
    value={true}
    onChange={(checked) => console.log(checked)}
    label="Enable feature"
    description="This will enable the advanced feature"
  />
</SettingItem>
```

### Tab

**Purpose**: A tab component used within the Tabs container for organizing content.

**Main Properties**:

- `id` (string): Unique identifier for the tab
- `title` (string): Tab title displayed in the tab header
- `children` (ReactNode): Content to display when tab is active

**Example**:

```javascript
<Tab id="general" title="General Settings">
  <Section>General settings content here</Section>
</Tab>
```

### Tabs

**Purpose**: A tab container component that manages multiple Tab components.

**Main Properties**:

- `defaultActiveTab` (string): ID of the initially active tab
- `children` (ReactNode): Tab components
- `className` (string): Additional CSS classes

**Example**:

```javascript
<Tabs defaultActiveTab="general">
  <Tab id="general" title="General">
    <div>General settings</div>
  </Tab>
  <Tab id="advanced" title="Advanced">
    <div>Advanced settings</div>
  </Tab>
</Tabs>
```

### TableContainer

**Purpose**: A table component with built-in support for adding new rows, managing data, and displaying customizable columns. Ideal for managing lists of configurable items like action sets, API endpoints, or any collection of editable data.

**Main Properties**:

- `addButtonText` (string): Text to display on the add button
- `addButtonTitle` (string): Tooltip text for the add button
- `emptyMessage` (string): Message to display when there are no rows
- `columns` (array): Array of column definition objects
  - `content` (string): Column header text
  - `compact` (boolean): Whether the column should be compact (for controls)
- `onAdd` (function): Callback when the add button is clicked
- `rows` (array): Array of row data, where each row is an array of React elements

**Example**:

```javascript
import { getUniqueId } from "@utils";
<TableContainer
  addButtonText="Add Item"
  addButtonTitle="Add a new item to the list"
  emptyMessage="No items have been defined."
  columns={[
    { content: "Name" },
    { content: "Value" },
    { content: "", compact: true }, // For controls/actions
  ]}
  onAdd={() => {
    // Add new item logic
    setItems([...items, { id: getUniqueId(), name: "", value: "" }]);
  }}
  rows={items.map((item, index) => [
    <TextInput
      value={item.name}
      onChange={(e) => updateItem(index, "name", e.currentTarget.value)}
    />,
    <TextInput
      value={item.value}
      onChange={(e) => updateItem(index, "value", e.currentTarget.value)}
    />,
    <OptionsMenuRootButton
      key={index}
      options={[
        {
          text: "Delete",
          tip: "Delete this item",
          icon: deleteIcon,
          type: "onClick",
          onClick: () => deleteItem(index),
        },
      ]}
    />,
  ])}
/>;
```

### Section

**Purpose**: A section container component for grouping related settings.

**Main Properties**:

- `children` (ReactNode): Content to display within the section
- `className` (string): Additional CSS classes

**Example**:

```javascript
<Section className="appearance-section">
  <ColorPicker value="#ff0000" onChange={handleColorChange} />
  <FontSelector value="Arial" onChange={handleFontChange} />
</Section>
```

### Label

**Purpose**: A label component with optional help text support.

**Main Properties**:

- `content` (string): Label text content
- `help` (string): Help text to display in a tooltip

**Example**:

```javascript
<Label
  content="Background Color"
  help="Choose the background color for your element"
/>
```

### SettingItem

**Purpose**: A wrapper component that provides consistent spacing for setting items.

**Main Properties**:

- `children` (ReactNode): Content to wrap with consistent spacing

**Example**:

```javascript
<SettingItem>
  <Label content="Font Size" />
  <NumberInput value={16} onChange={handleFontSizeChange} />
</SettingItem>
```

### IconButton

**Purpose**: A button component that displays an icon, typically used for operations like deleting or editing items.

**Main Properties**:

- `icon` (string): SVG icon to display inside the button
- `onClick` (function): Click event handler
- `style` (enum): 50|40|30|25|'fill-height' (default: 50)
- `disabled` (boolean): Whether the button is disabled
- `className` (string): Additional CSS classes

**Example**:

```javascript
<IconButton
  icon="<svg>...</svg>"
  onClick={() => console.log("Icon button clicked")}
  style="40"
  disabled={false}
/>
```

### Icons

**Purpose**: A collection of SVG icons that can be used in various components.

Icons are imported from the `@icons` module and can be used directly in components like `IconButton`.

**IMPORTANT**: `@icons` can only be imported in the editor environment, not in the live component.

```javascript
import { addIcon, editIcon, deleteIcon } from "@icons";
<IconButton
  icon={addIcon}
  onClick={() => console.log("Add clicked")}
  style="50"
/>;
```

**Available Icons**:

- `addIcon`
- `editIcon`
- `deleteIcon`
- `arrowDownIcon`
- `arrowLeftIcon`
- `arrowRightIcon`
- `arrowUpIcon`
- `duplicateIcon`
- `searchIcon`
- `settingsIcon`
- `closeIcon`
- `infoIcon`

### ActionSet

**Purpose**: An ActionSet component that allows users to configure and manage a set of actions that can be triggered in response to events. This component provides a user-friendly interface for defining complex behavior without writing code.

**Main Properties**:

- `value` (array): Array of action objects representing the current action set
- `onChange` (function): Callback when the action set changes

**Example**:

#### Configuring Action Sets in Settings

```javascript
import { ActionSet, SettingItem, Label } from "@ui";

function Settings({ state, setState }) {
  return (
    <Section>
      <SettingItem>
        <Label
          content="Actions"
          help="Configure actions to trigger on events"
        />
        <ActionSet
          value={state.actions}
          onChange={(actions) => setState((prev) => ({ ...prev, actions }))}
        />
      </SettingItem>
    </Section>
  );
}
```

#### Running Action Sets in Live Component

In the live component, use the `runActionSet` function to execute the configured actions in response to events:

```javascript
import { runActionSet } from "@data";

export function Component({ state }) {
  const handleEvent = async () => {
    await runActionSet(state.actions);
  };

  return <button onClick={handleEvent}>Trigger Actions</button>;
}
```

### Drawer

**Purpose**: A Drawer component that provides a slide-out panel for displaying additional content or settings without navigating away from the current view.

**Main Properties**:

- `isOpen` (boolean): Whether the drawer is open
- `onClose` (function): Callback when the drawer is requested to close
- `title` (string): Title text for the drawer
- `width` (number): Width of the drawer in pixels (default: 800)
- `className` (string): Additional CSS classes
- `children` (ReactNode): Content to display inside the drawer

**Example**:

```javascript
import { Drawer, Button } from "@ui";
import { useState } from "react";

function Example() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button text="Open Drawer" onClick={() => setDrawerOpen(true)} />
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Settings"
      >
        <DrawerSection>
          <div>Additional settings content here</div>
        </DrawerSection>
        <DrawerSection>
          <div>More content can go here</div>
        </DrawerSection>
      </Drawer>
    </>
  );
}
```

### DrawerSection

**Purpose**: A section container component specifically designed for use within the Drawer component. It provides consistent spacing and styling for grouping related content inside the drawer. It is mandatory to use `DrawerSection` inside `Drawer` for proper layout.

**Main Properties**:

- `children` (ReactNode): Content to display within the section

### DynamicValues

**Purpose**: DynamicValues provide a powerful way to connect component properties to dynamic data sources in the Dot.vu platform. They allow components to receive data from various sources such as user input, API calls, database queries, or other components, making components truly interactive and data-driven.

#### What are DynamicValues?

DynamicValues are objects that represent data connections. Instead of static values, they provide:

- **Dynamic data binding**: Connect to other Dot.vu components or add-ons.
- **Automatic updates**: Values update when the underlying data changes
- **Type safety**: Ensure data matches expected types
- **Data validation**: Built-in validation for different data types

#### Creating DynamicValues

DynamicValues are typically created using the `createDynamicValue` function from `@data`:

```javascript
import { createDynamicValue } from "@data";

// Create a dynamic value for text input
const titleValue = createDynamicValue("text", "Default Title");

// Create a dynamic value for numeric input
const countValue = createDynamicValue("number", 10);

// Create a dynamic value for boolean
const enabledValue = createDynamicValue("boolean", true);

// Create a dynamic value for lists/arrays
const itemsValue = createDynamicValue("list", ["Item 1", "Item 2"]);

// Create a dynamic value for images
const imageValue = createDynamicValue("image", "https://placehold.co/300x200");

// Create a dynamic value for colors
const colorValue = createDynamicValue("color", "#ff0000");
```

#### Using DynamicValues in State

When defining component state, use DynamicValues for properties that should be dynamic:

```javascript
import { createDynamicValue } from "@data";

export function getInitialState(state) {
  return {
    title: createDynamicValue("text", "Hello World"),
    count: createDynamicValue("number", 5),
    isEnabled: createDynamicValue("boolean", true),
    backgroundColor: createDynamicValue("color", "#ffffff"),
    items: createDynamicValue("list", ["Item 1", "Item 2", "Item 3"]),
    image: createDynamicValue("image", "https://placehold.co/300x200"),
    ...state,
  };
}
```

#### Using DynamicValues in Components

In the live component, use the `useDynamicValues` hook to resolve dynamic values:

```javascript
import React from "react";
import { useDynamicValues } from "@data";

export function Component({ state, scale = 1 }) {
  // Resolve all dynamic values from state
  const { values, status } = useDynamicValues({
    title: state.title,
    count: state.count,
    backgroundColor: state.backgroundColor,
    items: state.items,
  });

  // Handle loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Use resolved values in rendering
  return (
    <div style={{ backgroundColor: values.backgroundColor }}>
      <h1>{values.title}</h1>
      <p>Count: {values.count}</p>
      <ul>
        {values.items?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### DynamicValueInput Component

The `DynamicValueInput` component allows users to configure dynamic values in the editor interface:

```javascript
import React from "react";
import { DynamicValueInput, SettingItem, Label } from "@ui";

function Settings({ state, setState }) {
  return (
    <Section>
      <SettingItem>
        <Label content="Title" help="Set the title text" />
        <DynamicValueInput
          value={state.title}
          onChange={(value) => setState((prev) => ({ ...prev, title: value }))}
        />
      </SettingItem>

      <SettingItem>
        <Label content="Count" help="Set a numeric value" />
        <DynamicValueInput
          value={state.count}
          onChange={(value) => setState((prev) => ({ ...prev, count: value }))}
        />
      </SettingItem>

      <SettingItem>
        <Label content="Background Color" help="Choose background color" />
        <DynamicValueInput
          value={state.backgroundColor}
          onChange={(value) =>
            setState((prev) => ({ ...prev, backgroundColor: value }))
          }
        />
      </SettingItem>
    </Section>
  );
}
```

#### resolveDynamicValue and resolveDynamicValues Function

In some cases, you may need to resolve a single dynamic value outside of the `useDynamicValues` hook. Use the `resolveDynamicValue` function. This is useful for resolving dynamic values in non-React contexts, such as action handlers or utility functions.

```javascript
import { resolveDynamicValue, resolveDynamicValues } from "@data";

// Resolving a single dynamic value
const resolvedValue = await resolveDynamicValue(dynamicValue);

// Use the resolved value
console.log(resolvedValue);

// Resolving multiple dynamic values at once
const resolvedValues = await resolveDynamicValues({
  title: dynamicValueTitle,
  count: dynamicValueCount,
});

// Use the resolved values
console.log(resolvedValues.title, resolvedValues.count);
```

#### Supported Data Types

| Type      | Description        | Example Use Case                 |
| --------- | ------------------ | -------------------------------- |
| `text`    | Plain text strings | Titles, descriptions, labels     |
| `number`  | Numeric values     | Counters, dimensions, quantities |
| `boolean` | True/false values  | Toggle states, visibility flags  |
| `list`    | Arrays of strings  | Menu items, tag lists            |
| `image`   | Image URLs         | Profile pictures, backgrounds    |
| `color`   | Color values       | Themes, styling                  |

#### Best Practices for DynamicValues

1. **Always provide default values**: Use meaningful defaults when creating dynamic values
2. **Handle loading states**: Always check the status from `useDynamicValues` and show appropriate loading UI
3. **Use appropriate types**: Choose the correct data type for your use case
4. **Validate resolved values**: Check for undefined/null values before using them
5. **Performance optimization**: Only pass the dynamic values you actually need to `useDynamicValues`

#### Common Patterns

**Conditional Rendering based on Dynamic Boolean**:

```javascript
const { values } = useDynamicValues({ showContent: state.showContent });
return <div>{values.showContent && <div>Dynamic content here</div>}</div>;
```

**Dynamic Styling**:

```javascript
const { values } = useDynamicValues({
  bgColor: state.backgroundColor,
  textColor: state.textColor,
});
return (
  <div
    style={{
      backgroundColor: values.bgColor,
      color: values.textColor,
    }}
  >
    Content
  </div>
);
```

**Dynamic Lists**:

```javascript
const { values } = useDynamicValues({ items: state.items });
return (
  <ul>
    {values.items?.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
```

### Usage Patterns

#### Complete Settings Panel Example

```javascript
<Tabs defaultActiveTab="appearance">
  <Tab id="appearance" title="Appearance">
    <Section>
      <SettingItem>
        <Label content="Background Color" help="Choose your background color" />
        <ColorPicker value="#ffffff" onChange={handleBgColorChange} />
      </SettingItem>

      <SettingItem>
        <Label content="Font Family" />
        <FontSelector value="Arial" onChange={handleFontChange} />
      </SettingItem>

      <SettingItem>
        <Label content="Font Size" />
        <NumberInput
          value={16}
          onChange={handleFontSizeChange}
          min={8}
          max={72}
          step={1}
        />
      </SettingItem>
    </Section>
  </Tab>

  <Tab id="layout" title="Layout">
    <Section>
      <SettingItem>
        <Label content="Alignment" />
        <Dropdown
          value="center"
          options={[
            { value: "left", text: "Left" },
            { value: "center", text: "Center" },
            { value: "right", text: "Right" },
          ]}
          onChange={handleAlignmentChange}
        />
      </SettingItem>

      <SettingItem>
        <Checkbox
          value={true}
          onChange={handleVisibilityChange}
          label="Visible"
          description="Show this element on the page"
        />
      </SettingItem>
    </Section>
  </Tab>
</Tabs>
```

#### TableContainer with OptionsMenuRootButton and Drawer Example

This example demonstrates how to use `TableContainer` to manage a list of API endpoints, with each row having an options menu for editing or deleting the endpoint. The edit option opens a `Drawer` for detailed settings.

```javascript
import { getUniqueId } from '@utils'
import { editIcon, deleteIcon, settingsIcon } from '@icons'
import { useState } from 'react'
import {
  TableContainer,
  TextInput,
  OptionsMenuRootButton,
  Drawer,
  DrawerSection,
  SettingItem,
  Label,
  Dropdown
} from '@ui'

const [drawerOpen, setDrawerOpen] = useState(false)
const [selectedEndpoint, setSelectedEndpoint] = useState(null)

<TableContainer
  addButtonText="Add Endpoint"
  emptyMessage="No API endpoints have been configured."
  columns={[
    { content: 'Name' },
    { content: '', compact: true }
  ]}
  onAdd={() => {
    onChange([...apiEndpoints, { id: getUniqueId(), name: '', url: '' }])
  }}
  rows={apiEndpoints.map((endpoint, i) => [
    <TextInput
      value={endpoint.name}
      onChange={e => updateEndpoint(i, 'name', e.currentTarget.value)}
    />,
    <OptionsMenuRootButton
      key={i}
      options={[
        {
          text: 'Configure',
          tip: 'Open detailed settings',
          icon: settingsIcon,
          type: 'onClick',
          onClick: () => {
            setSelectedEndpoint(endpoint)
            setDrawerOpen(true)
          }
        },
        {
          text: 'Delete',
          tip: 'Delete this endpoint',
          icon: deleteIcon,
          type: 'onClick',
          onClick: () => deleteEndpoint(i)
        }
      ]}
    />
  ])}
/>

<Drawer
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  title="Endpoint Settings"
>
  <DrawerSection>
    <SettingItem>
      <Label content="URL" />
      <TextInput
        value={selectedEndpoint?.url}
        onChange={e => updateSelectedEndpoint({ url: e.currentTarget.value })}
        placeholder="https://api.example.com/endpoint"
      />
    </SettingItem>

    <SettingItem>
      <Label content="Method" />
      <Dropdown
        value={selectedEndpoint?.method}
        options={[
          { value: 'GET', text: 'GET' },
          { value: 'POST', text: 'POST' }
        ]}
        onChange={method => updateSelectedEndpoint({ method })}
      />
    </SettingItem>
  <DrawerSection>
</Drawer>
```

### Notes

- Prevent as much as possible to use raw HTML or inline styles - prefer using the provided components and CSS classes for settings.
- All components are designed to work together and follow consistent patterns
- Components handle their own state management internally where appropriate
- The `onChange` for TextInput receives a React event as the first parameter - use `e.currentTarget.value` to get the value
- Other components like ColorPicker, FontSelector, etc. receive the new value as their first parameter
- Components are styled using CSS classes and follow the Dot.vu design system
- `TableContainer` and `OptionsMenuRootButton` work perfectly together for managing collections of editable data
- Use the Master-detail pattern with `TableContainer` for listing items and `Drawer` for editing item details. You can have multipler `Drawer`s nested if needed.
- Do not use a "Save" and "Cancel" button in the `Drawer` - changes should be saved immediately as the user makes them. The `onClose` of the `Drawer` is just to close the panel.
