---
name: settings-animation
description: "Rules and patterns for animation settings in Dot.vu components — Type, Duration, Start Animation (on load / manually), Triggers (Animation Starts, Animation Ends), Action (Start Animation), and a Preview Animation button for ambient or scroll-driven animations. Use whenever a component has an animation that needs editor controls."
---

# Animation Settings

Use this skill when a component has animations that need editor controls, triggers, and actions.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## Two patterns

### Pattern A — Triggerable animation

Use when the animation has a clear start and end (entry animations, reveals, bounces, pulses). The editor lets the user choose whether the animation plays on load or only when triggered by an action.

- Settings: **Type**, **Duration**, **Start Animation** (On Load / Manually)
- Triggers: **Animation Starts**, **Animation Ends**
- Actions: **Start Animation** (inbound)

### Pattern B — Ambient or scroll-driven animation

Use when the animation is continuous, scroll-driven, or tied to an interaction (scroll reveals, looping effects, progress-based animations). There is no discrete "start" moment, so the Start Animation setting is replaced by a **Preview Animation** button in the editor.

- Settings: **Type**, **Duration** (and any component-specific parameters)
- No Start Animation setting
- A **Preview Animation** button in the Animation tab instead
- Triggers and actions are component-specific

---

## Pattern A — Triggerable Animation

### common.js — state fields

Add before `...state`:

```js
animationType: 'fade-in',
animationDuration: 600,
animationStart: 'on-load',
animationRevision: 0,
```

`animationRevision` is an integer that increments each time the animation is triggered. It is never shown in the editor — it is the mechanism that replays the animation in live.js.

---

### editor.js — Animation tab

Define the type options as a named constant above `Settings`:

```js
const ANIMATION_TYPE_OPTIONS = [
  { value: "fade-in", text: "Fade In" },
  { value: "slide-up", text: "Slide Up" },
  { value: "slide-down", text: "Slide Down" },
  { value: "slide-left", text: "Slide In from Left" },
  { value: "slide-right", text: "Slide In from Right" },
  { value: "scale-in", text: "Scale In" },
  { value: "bounce", text: "Bounce" },
];
```

Replace the list with the animation types the component actually supports.

Inside `<Tabs>`, add:

```jsx
<Tab id="animation" title="Animation">
  <Section>
    <div className="cmp-settings-section-heading">motion</div>
    <SettingItem>
      <Label content="Type" />
      <Dropdown
        options={ANIMATION_TYPE_OPTIONS}
        value={state.animationType}
        onChange={(animationType) => setState({ ...state, animationType })}
      />
    </SettingItem>
    <SettingItem>
      <Label content="Duration (ms)" />
      <NumberInput
        value={state.animationDuration}
        min={100}
        max={3000}
        step={50}
        onChange={(animationDuration) =>
          setState({ ...state, animationDuration })
        }
      />
    </SettingItem>
    <SettingItem>
      <Label
        content="Start Animation"
        help="Choose when the animation plays. Select 'Manually' to control it with the Start Animation action."
      />
      <Dropdown
        options={[
          { value: "on-load", text: "On Load" },
          { value: "manual", text: "Manually" },
        ]}
        value={state.animationStart}
        onChange={(animationStart) => setState({ ...state, animationStart })}
      />
    </SettingItem>
  </Section>
</Tab>
```

---

### editor.js — getTriggers and getActions

```js
export function getTriggers(state) {
  return {
    onAnimationStart: { name: "Animation Starts" },
    onAnimationEnd: { name: "Animation Ends" },
  };
}

export function getActions(state) {
  return {
    startAnimation: { name: "Start Animation" },
  };
}
```

---

### live.js — getActionHandlers

```js
export function getActionHandlers({ setState }) {
  return {
    async startAnimation({ setComponentState }) {
      setComponentState((prev) => ({
        ...prev,
        animationRevision: (Number(prev.animationRevision) || 0) + 1,
      }));
    },
  };
}
```

---

### live.js — refs and helpers inside Component

Declare immediately after `const { s } = useScaler()`:

```js
const animatedRef = useRef(null);
```

Define `playAnimation` as a local function inside `Component`:

```js
function playAnimation() {
  const el = animatedRef.current;
  if (!el) return;
  el.classList.remove("cmp-animate");
  void el.offsetWidth; // force reflow to restart CSS animation
  el.classList.add("cmp-animate");
  runTrigger("onAnimationStart");
}
```

---

### live.js — useEffect hooks

On load:

```js
useEffect(() => {
  if (state.animationStart === "on-load") {
    playAnimation();
  }
}, []);
```

On action trigger:

```js
useEffect(() => {
  const revision = Number(state.animationRevision) || 0;
  if (revision > 0) {
    playAnimation();
  }
}, [state.animationRevision]);
```

On animation type or duration change, reset the element so no stale animation class lingers:

```js
useEffect(() => {
  const el = animatedRef.current;
  if (el) el.classList.remove("cmp-animate");
}, [state.animationType, state.animationDuration]);
```

---

### live.js — JSX

Attach `ref` and `onAnimationEnd` to the element being animated:

```jsx
<div
  ref={animatedRef}
  className="cmp-root"
  onAnimationEnd={() => runTrigger("onAnimationEnd")}
>
  {/* component content */}
</div>
```

---

### live.js — CSS keyframes and animation class

Define keyframes and the `.cmp-animate` class inside `<ScopedStyle>`. Use `s()` for any pixel values inside transforms; durations come from `state.animationDuration` directly (ms values, not scaled).

```js
const duration = Math.max(100, Number(state.animationDuration) || 600);

const animationCSS = {
  "fade-in": `opacity 0 1`,
  "slide-up": `opacity 0 1, transform translateY(${s(24)}px) translateY(0)`,
  "slide-down": `opacity 0 1, transform translateY(-${s(24)}px) translateY(0)`,
  "slide-left": `opacity 0 1, transform translateX(${s(24)}px) translateX(0)`,
  "slide-right": `opacity 0 1, transform translateX(-${s(24)}px) translateX(0)`,
  "scale-in": `opacity 0 1, transform scale(0.85) scale(1)`,
  bounce: `transform scale(1) scale(1.08) scale(0.96) scale(1)`,
};
```

Use an explicit keyframe block in the scoped styles string:

```js
const styles = `
  @keyframes cmp-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cmp-slide-up {
    from { opacity: 0; transform: translateY(${s(24)}px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cmp-slide-down {
    from { opacity: 0; transform: translateY(-${s(24)}px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cmp-slide-left {
    from { opacity: 0; transform: translateX(${s(24)}px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes cmp-slide-right {
    from { opacity: 0; transform: translateX(-${s(24)}px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes cmp-scale-in {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cmp-bounce {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    70%  { transform: scale(0.96); }
    100% { transform: scale(1); }
  }

  .cmp-root {
    /* resting state — fully visible so the component is readable before animation plays */
  }
  .cmp-root.cmp-animate {
    animation: cmp-${state.animationType} ${duration}ms ease both;
  }
`;
```

Adjust keyframes to match only the animation types the component actually supports. Do not include keyframes for types not in the Type dropdown.

---

## Pattern B — Ambient or Scroll-driven Animation

### common.js — state fields

Include `animationRevision: 0` — it is the replay mechanism for the preview button. Omit `animationStart`. Include only the component-specific animation settings:

```js
animationMode: 'character',
animationRevision: 0,
```

Replace `animationMode` with whatever parameters the component actually uses (e.g. `scrollDuration` for scroll-based components).

---

### editor.js — Animation tab with inline preview button

Do **not** use `Button` from `@ui` and do **not** wrap the preview button in `<SettingItem>`. Place an inline native `<button>` in a flex row alongside the primary animation control (the Mode or Type dropdown). This avoids an extra settings row and keeps the preview action visually associated with the control it demonstrates.

The button uses the Dot.vu primary orange `#f57b37` on a transparent background, with the play-circle icon as an inline SVG.

For component-specific settings that depend on the live preview environment (e.g. scroll track height), add a help string noting that the user needs to click **Preview** in the studio to see the effect.

```jsx
<Tab id="animation" title="Animation">
  <Section>
    <div className="cmp-settings-section-heading">motion</div>
    <SettingItem>
      <Label content="Animation Mode" help="Describe what this controls." />
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div>
          <Dropdown
            options={ANIMATION_TYPE_OPTIONS}
            value={state.animationMode}
            onChange={(animationMode) => setState({ ...state, animationMode })}
          />
        </div>
        <button
          title="Preview Animation"
          onClick={() =>
            setState({
              ...state,
              animationRevision: (Number(state.animationRevision) || 0) + 1,
            })
          }
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            padding: 0,
            border: "none",
            borderRadius: "6px",
            background: "transparent",
            cursor: "pointer",
            color: "#f57b37",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18px"
            viewBox="0 -960 960 960"
            width="18px"
            fill="currentColor"
          >
            <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
          </svg>
        </button>
      </div>
    </SettingItem>
    <SettingItem>
      <Label
        content="Scroll Distance (vh)"
        help="Height of the scroll track. A higher value means the user scrolls further to complete the reveal. To see this effect, click Preview in the studio."
      />
      <NumberInput
        value={state.scrollDuration}
        min={100}
        max={1000}
        step={50}
        onChange={(scrollDuration) => setState({ ...state, scrollDuration })}
      />
    </SettingItem>
  </Section>
</Tab>
```

Note: for scroll-track height, use the label **"Scroll Distance (vh)"** — not "Scroll Duration" — because the value controls height, not time.

---

### editor.js — getTriggers

```js
export function getTriggers() {
  return {
    onAnimationStart: { name: "Animation Starts" },
    onAnimationEnd: { name: "Animation Ends" },
  };
}
```

Add any component-specific triggers alongside these (e.g. `onRevealComplete`).

---

### live.js — refs

Declare alongside the component's existing refs:

```js
const previewRef = useRef(null); // holds the setInterval ID for the preview playback
const resetTimeoutRef = useRef(null); // holds the setTimeout ID for the post-preview reset
```

---

### live.js — preview useEffect

Watch `state.animationRevision`. When it increments:

1. Cancel any in-flight playback or reset
2. Reset all animated units to their inactive state
3. Fire `onAnimationStart`
4. Step through each unit over ~1.5 s using `setInterval`
5. After the last unit, fire `onAnimationEnd`, then after 800 ms reset all units back to inactive

```js
useEffect(() => {
  const revision = Number(state.animationRevision) || 0;
  if (revision === 0) return;

  if (previewRef.current) clearInterval(previewRef.current);
  if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

  const items = itemsRef.current.filter(Boolean);
  if (!items.length) return;

  items.forEach((el) => {
    el.style.color = state.inactiveColor;
  });
  runTrigger("onAnimationStart");

  const stepInterval = Math.max(16, 1500 / items.length);
  let index = 0;

  previewRef.current = setInterval(() => {
    if (index < items.length) {
      if (items[index]) items[index].style.color = state.activeColor;
      index++;
    }
    if (index >= items.length) {
      clearInterval(previewRef.current);
      previewRef.current = null;
      runTrigger("onAnimationEnd");
      resetTimeoutRef.current = setTimeout(() => {
        items.forEach((el) => {
          if (el) el.style.color = state.inactiveColor;
        });
        resetTimeoutRef.current = null;
      }, 800);
    }
  }, stepInterval);
}, [state.animationRevision]);
```

---

### live.js — cleanup

Cancel both timers on unmount:

```js
useEffect(() => {
  return () => {
    if (previewRef.current) clearInterval(previewRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
  };
}, []);
```

Also clear both at the top of the preview `useEffect` (already shown above) so a second press of the preview button cancels any in-progress playback or pending reset.

---

## Choosing between patterns

| Situation                                                         | Pattern         |
| ----------------------------------------------------------------- | --------------- |
| Entry animation that plays on load or via action                  | A — Triggerable |
| Animation that the user can manually start in the live experience | A — Triggerable |
| Scroll-driven animation                                           | B — Ambient     |
| Looping or continuous animation                                   | B — Ambient     |
| Animation always playing, no discrete start                       | B — Ambient     |

---

## What not to do

```js
// Do NOT use setTimeout to detect animation end — use the onAnimationEnd DOM event
setTimeout(() => runTrigger('onAnimationEnd'), state.animationDuration)

// Do NOT call runTrigger inside getActionHandlers — run triggers from Component
async startAnimation({ setComponentState, runTrigger }) {
  runTrigger('onAnimationStart') // wrong — runTrigger is not reliable here
}

// Do NOT skip animationRevision and use only isAnimating:true/false
// A boolean cannot replay the animation on a second trigger without a forced reflow
setState({ ...state, isAnimating: true })

// Do NOT hardcode pixel distances in keyframes without s()
from { transform: translateY(24px); } /* wrong — use s(24) */

// Do NOT include unused keyframes for animation types not in the Type dropdown
```
