---
name: settings-range-slider
description: "Rules and patterns for single-thumb and dual-thumb range sliders in editor.js — styled native HTML inputs, buildTicks helper, accent color, and Label pairing. Use when a setting needs a visual slider instead of a NumberInput, or when a min/max pair should be combined into one dual-thumb control."
---

# Settings Range Slider

Use these components when a setting benefits from a visual slider rather than a `NumberInput`. Two variants exist:

- **`SingleSlider`** — one thumb, one value. Use for settings like Spawn Frequency.
- **`RangeSlider`** — two thumbs on one track, one min value and one max value. Use for Speed Range, diameter ranges, etc.

Both components use plain HTML `<input type="range">` — there is no `@ui` slider component. Both rely on shared CSS classes that must be present in `editorStyles`.

---

## CSS (add to `editorStyles`)

```css
.cmp-range-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cmp-range-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}
.cmp-range-ticks span {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1;
}

/* ── SingleSlider ─────────────────────────── */
.cmp-single-input {
  width: 100%;
  display: block;
  cursor: pointer;
  accent-color: #f57b37;
  margin: 4px 0 8px;
}
.cmp-single-input::-webkit-slider-runnable-track {
  background: #e5e7eb;
  height: 4px;
  border-radius: 2px;
}
.cmp-single-input::-moz-range-track {
  background: #e5e7eb;
  height: 4px;
  border-radius: 2px;
}

/* ── RangeSlider (dual-thumb) ─────────────── */
.cmp-dual-track {
  position: relative;
  height: 20px;
  margin: 4px 0;
}
.cmp-dual-track::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  background: #e5e7eb;
  border-radius: 2px;
}
.cmp-dual-fill {
  position: absolute;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  background: #f57b37;
  border-radius: 2px;
  pointer-events: none;
}
.cmp-dual-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
.cmp-dual-input::-webkit-slider-runnable-track {
  background: transparent;
  height: 4px;
}
.cmp-dual-input::-webkit-slider-thumb {
  pointer-events: all;
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f57b37;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  margin-top: -8px;
}
.cmp-dual-input::-moz-range-track {
  background: transparent;
  height: 4px;
}
.cmp-dual-input::-moz-range-thumb {
  pointer-events: all;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f57b37;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
```

**Replace `cmp-` with the component's own class prefix** (e.g. `bg-` for a balloon game component).

**Accent color** — `#f57b37` is the Dot.vu orange used across both slider types. Update it to match the component's brand color if needed.

**Thumb centering** — `margin-top: -8px` on `::-webkit-slider-thumb` centers the 16px thumb (plus 2px border on each side = 20px total) on the 4px track: `(4 − 20) / 2 = −8px`. Do not use `-6px`.

**Track color** — both variants use `#e5e7eb` (Tailwind `gray-200`) for the inactive track rail. The dual-thumb fill between the two thumbs uses the accent color.

---

## Helper — `buildTicks`

Place this function above the slider components. It generates tick labels for the slider's step marks, capping at ~10 visible ticks for dense ranges.

```js
function buildTicks(min, max, step) {
  const count = Math.round((max - min) / step);
  const all = Array.from({ length: count + 1 }, (_, i) => min + i * step);
  if (all.length <= 11) return all;
  const interval = Math.ceil(count / 9);
  return all.filter((_, i) => i % interval === 0 || i === count);
}
```

---

## `SingleSlider` component

```jsx
function SingleSlider({ label, min, max, step = 1, value, onChange }) {
  const ticks = buildTicks(min, max, step);
  return (
    <div className="cmp-range-wrap">
      {label && (
        <div
          style={{
            fontSize: 12,
            color: "#374151",
            fontWeight: 600,
            padding: "0 2px",
          }}
        >
          {label}
        </div>
      )}
      <input
        className="cmp-single-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="cmp-range-ticks">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
```

**Props**

| Prop       | Type     | Required | Notes                                                                                       |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `label`    | string   | no       | Renders an internal label above the track. Omit when using `<Label>` outside the component. |
| `min`      | number   | yes      |                                                                                             |
| `max`      | number   | yes      |                                                                                             |
| `step`     | number   | no       | Defaults to `1`                                                                             |
| `value`    | number   | yes      | Controlled value                                                                            |
| `onChange` | function | yes      | Called with the new numeric value                                                           |

---

## `RangeSlider` component (dual-thumb)

```jsx
function RangeSlider({
  label,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}) {
  const ticks = buildTicks(min, max, step);
  const range = max - min;
  const pctLow = ((valueMin - min) / range) * 100;
  const pctHigh = ((valueMax - min) / range) * 100;
  return (
    <div className="cmp-range-wrap">
      {label && (
        <div
          style={{
            fontSize: 12,
            color: "#374151",
            fontWeight: 600,
            padding: "0 2px",
          }}
        >
          {label}
        </div>
      )}
      <div className="cmp-dual-track">
        <div
          className="cmp-dual-fill"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />
        <input
          className="cmp-dual-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) =>
            onChangeMin(Math.min(Number(e.target.value), valueMax - step))
          }
        />
        <input
          className="cmp-dual-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) =>
            onChangeMax(Math.max(Number(e.target.value), valueMin + step))
          }
        />
      </div>
      <div className="cmp-range-ticks">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
```

**Props**

| Prop          | Type     | Required | Notes                                                         |
| ------------- | -------- | -------- | ------------------------------------------------------------- |
| `label`       | string   | no       | Renders an internal label. Omit when using `<Label>` outside. |
| `min`         | number   | yes      |                                                               |
| `max`         | number   | yes      |                                                               |
| `step`        | number   | no       | Defaults to `1`. Also used as the minimum gap between thumbs. |
| `valueMin`    | number   | yes      | Current lower bound                                           |
| `valueMax`    | number   | yes      | Current upper bound                                           |
| `onChangeMin` | function | yes      | Called with the new min value                                 |
| `onChangeMax` | function | yes      | Called with the new max value                                 |

The two `<input>` elements are stacked with `position: absolute` and `pointer-events: none` on the element but `pointer-events: all` on the thumb pseudo-element. The `.cmp-dual-fill` div renders the active segment using computed `left`/`right` percentages.

---

## Usage patterns

### With external `Label` (preferred for consistency)

When the slider appears inside a `<SettingItem>`, use `<Label>` above and omit `label` from the slider:

```jsx
<SettingItem>
  <Label content="Spawn Frequency" help="Relative weight (1 = rare, 10 = common)." />
  <SingleSlider
    min={1}
    max={10}
    step={1}
    value={state.spawnWeight}
    onChange={(spawnWeight) => set({ spawnWeight })}
  />
</SettingItem>

<SettingItem>
  <Label content="Speed Range" help="Float speed range (px/s)." />
  <RangeSlider
    min={10}
    max={300}
    step={5}
    valueMin={state.speedMin}
    valueMax={state.speedMax}
    onChangeMin={(speedMin) => set({ speedMin })}
    onChangeMax={(speedMax) => set({ speedMax })}
  />
</SettingItem>
```

### With internal label (standalone use)

Pass `label` when the slider is used without an external `<Label>`:

```jsx
<SettingItem>
  <RangeSlider
    label="Float Speed"
    min={10}
    max={400}
    step={5}
    valueMin={state.floatSpeedMin}
    valueMax={state.floatSpeedMax}
    onChangeMin={(floatSpeedMin) => set({ floatSpeedMin })}
    onChangeMax={(floatSpeedMax) => set({ floatSpeedMax })}
  />
</SettingItem>
```

---

## State fields

Add both bounds to `common.js` `getInitialState` before `...state`:

```js
speedMin: 40,
speedMax: 90,
```

Use the bounds in `live.js` by calling `randomBetween(state.speedMin, state.speedMax)`.

---

## Rules

- Always use `<SettingItem>` as the wrapper — never render sliders outside one.
- Do not show the selected value in the header. Ticks give the range context.
- Ticks show actual step values. `buildTicks` caps display at ~10 labels automatically.
- The minimum gap between `valueMin` and `valueMax` in `RangeSlider` is always one `step`.
- Do not use `unit` suffixes on ticks — keep them plain numbers.
- Do not call `s()` on slider values — these are editor-only controls, not live.js CSS.
