---
name: dotvu-api
description: 'Dot.vu component API reference — allowed imports, boilerplate skeletons for common.js, editor.js, and live.js (CONTENT_BASED, RESIZABLE, BREAKPOINT_AWARE), UI component notes, and the shadow color helper. Use when building a new component, looking up API signatures, or copying implementation patterns.'
---

# Dot.vu API Reference

Use this skill as the reference for component API signatures, allowed imports, and common implementation patterns. Rules and constraints live in `.github/instructions/dotvu-component.instructions.md`.

## common.js

```js
export function getInitialState(state) {
  return {
    heading: 'Default Heading',
    description: 'Default description.',
    ...state
  }
}
```

## editor.js skeleton

```js
import React from 'react'
import { Tabs, Tab, Section, SettingItem, Label, TextInput, NumberInput, Checkbox, FontSelector, ColorPicker, Dropdown } from '@ui'
import { SizeType } from '@constants'
import { getInitialState } from '@common/index'
export { getInitialState }

function Settings({ state, setState }) {
  return (
    <Tabs defaultActiveTab="content">
      <Tab id="content" title="Content">
        <Section>
          <div className="cmp-settings-section-heading">copy</div>
          <SettingItem>
            <Label content="Heading" />
            <TextInput value={state.heading} onChange={heading => setState({ ...state, heading })} />
          </SettingItem>
        </Section>
      </Tab>
    </Tabs>
  )
}

export function getSettings(state) {
  return {
    settings: {
      name: 'Component Settings',
      Setting: Settings,
      width: 420,
      help: () => ({
        title: 'Component Help',
        content: (
          <>
            <h1>Component Help</h1>
            <p>Explain what the component does and how to configure it.</p>
          </>
        )
      })
    }
  }
}

export function getDataFields(state) {
  return {
    heading: { name: 'Heading', type: 'text' }
  }
}

export function getActions(state) {
  return {}
}

export function getTriggers(state) {
  return {}
}

export function getFonts(state) {
  return [state.headingFont, state.bodyFont].filter(Boolean)
}

export function getSizeTypes(state) {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.CONTENT_BASED
  }
}

export function getLiveState(state) {
  return state
}
```

## live.js CONTENT_BASED skeleton

```js
// HEIGHT_PATTERN: CONTENT_BASED
import React from 'react'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index'
export { getInitialState }

export function getActionHandlers({ setState }) {
  return {}
}

export function Component({ state, setState, runTrigger }) {
  const { s } = useScaler()

  return (
    <div style={{ width: '100%', height: 'auto', boxSizing: 'border-box' }}>
      <ScopedStyle>{`
        .cmp-root, .cmp-root * {
          box-sizing: border-box;
        }
        .cmp-root {
          width: 100%;
          padding: ${s(24)}px;
          font-size: ${s(16)}px;
          line-height: 1.5;
        }
      `}</ScopedStyle>
      <div className="cmp-root">
        {state.heading}
      </div>
    </div>
  )
}
```

## live.js RESIZABLE skeleton

```js
// HEIGHT_PATTERN: RESIZABLE
import React from 'react'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index'
export { getInitialState }

export function getActionHandlers({ setState }) {
  return {}
}

export function Component({ state, setState, runTrigger }) {
  const { s } = useScaler()

  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
      <ScopedStyle>{`
        .cmp-root, .cmp-root * {
          box-sizing: border-box;
        }
        .cmp-root {
          width: 100%;
          height: 100%;
          padding: ${s(24)}px;
        }
      `}</ScopedStyle>
      <div className="cmp-root">
        {state.heading}
      </div>
    </div>
  )
}
```

## BREAKPOINT_AWARE state fields

Add these fields in `getInitialState` only for BREAKPOINT_AWARE components:

```js
hasWidthBreakpoint: true,
widthBreakpoint: 560,
previewWidthInLiveView: false,
currentComponentWidth: 0,
currentComponentHeight: 0,
```

## BREAKPOINT_AWARE getSizeTypes

```js
export function getSizeTypes(state) {
  const isNarrow = Boolean(state.hasWidthBreakpoint)
    && Number(state.currentComponentWidth) > 0
    && Number(state.currentComponentWidth) <= Math.max(120, Number(state.widthBreakpoint) || 120)
  const needsResizableHeight = Boolean(state.hasWidthBreakpoint) && !isNarrow
  return {
    width: SizeType.RESIZABLE,
    height: needsResizableHeight ? SizeType.RESIZABLE : SizeType.CONTENT_BASED
  }
}
```

## BREAKPOINT_AWARE Advanced tab section

```jsx
<Tab id="advanced" title="Advanced">
  <Section>
    <div className="cmp-settings-section-heading">responsive width</div>
    <SettingItem>
      <Checkbox
        value={state.hasWidthBreakpoint}
        onChange={hasWidthBreakpoint => setState({ ...state, hasWidthBreakpoint })}
        label="Enable width breakpoint"
      />
    </SettingItem>
    {state.hasWidthBreakpoint && (
      <>
        <SettingItem>
          <Label content="Breakpoint Width" help="When the component width reaches this value or below, it switches to a compact auto-height layout." />
          <NumberInput value={state.widthBreakpoint} min={120} max={2000} step={1} onChange={widthBreakpoint => setState({ ...state, widthBreakpoint })} />
        </SettingItem>
        <SettingItem>
          <Checkbox
            value={state.previewWidthInLiveView}
            onChange={previewWidthInLiveView => setState({ ...state, previewWidthInLiveView })}
            label="Preview current width in live view"
          />
        </SettingItem>
        <SettingItem>
          <Label content="Measured Size" help="Useful while tuning the responsive breakpoint in the editor." />
          <div>{`${Math.round(Number(state.currentComponentWidth) || 0)}px x ${Math.round(Number(state.currentComponentHeight) || 0)}px`}</div>
        </SettingItem>
      </>
    )}
  </Section>
</Tab>
```

## BREAKPOINT_AWARE live.js pattern

Use this full measurement and height override pattern. Do not simplify it.

```js
// HEIGHT_PATTERN: BREAKPOINT_AWARE
import React, { useEffect, useRef, useState } from 'react'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index'
export { getInitialState }

export function getActionHandlers({ setState }) {
  return {}
}

export function Component({ state, setState, runTrigger }) {
  const { s } = useScaler()
  const containerRef = useRef(null)
  const platformHeightRef = useRef(null)
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    let frameId = 0
    let secondFrameId = 0
    let intervalId = 0
    let observer = null

    const syncMeasuredSize = nextSize => {
      const safeWidth = Math.round(Number(nextSize.width) || 0)
      const safeHeight = Math.round(Number(nextSize.height) || 0)
      setMeasuredSize(prev => {
        if (prev.width === safeWidth && prev.height === safeHeight) return prev
        return { width: safeWidth, height: safeHeight }
      })
      setState(prev => {
        if (Number(prev.currentComponentWidth) === safeWidth && Number(prev.currentComponentHeight) === safeHeight) return prev
        return { ...prev, currentComponentWidth: safeWidth, currentComponentHeight: safeHeight }
      })
    }

    const measureNow = () => {
      if (!element) return
      const rect = element.getBoundingClientRect()
      syncMeasuredSize({ width: rect.width, height: rect.height })
    }

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(entries => {
        const entry = entries && entries[0]
        if (!entry) return
        const box = entry.contentRect || element.getBoundingClientRect()
        syncMeasuredSize({ width: box.width, height: box.height })
      })
      observer.observe(element)
    }

    measureNow()
    frameId = requestAnimationFrame(() => {
      measureNow()
      secondFrameId = requestAnimationFrame(measureNow)
    })
    intervalId = window.setInterval(measureNow, 250)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      if (secondFrameId) cancelAnimationFrame(secondFrameId)
      if (intervalId) window.clearInterval(intervalId)
      if (observer) observer.disconnect()
    }
  }, [setState])

  const liveMeasuredWidth = Math.max(0, Number(measuredSize.width) || 0)
  const measuredWidth = Math.max(0, liveMeasuredWidth || Number(state.currentComponentWidth) || 0)
  const responsiveBreakpointWidth = Math.max(120, Number(state.widthBreakpoint) || 120)
  const isCompactLayout = Boolean(state.hasWidthBreakpoint) && measuredWidth > 0 && measuredWidth <= responsiveBreakpointWidth
  const measurementLabel = Boolean(state.previewWidthInLiveView) ? `Width: ${liveMeasuredWidth || 0}px` : ''
  const needsAutoHeight = !Boolean(state.hasWidthBreakpoint) || isCompactLayout

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let ancestor = el.parentElement
    while (ancestor) {
      if (ancestor.classList && ancestor.classList.contains('dot-component')) {
        if (needsAutoHeight) {
          const currentHeight = ancestor.style.height
          if (currentHeight && currentHeight !== 'auto') platformHeightRef.current = currentHeight
          ancestor.style.height = 'auto'
        } else if (platformHeightRef.current) {
          ancestor.style.height = platformHeightRef.current
        }
        break
      }
      ancestor = ancestor.parentElement
    }
  }, [needsAutoHeight])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: (Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <ScopedStyle>{`
        .cmp-root, .cmp-root * {
          box-sizing: border-box;
        }
        .cmp-measurement-overlay {
          position: absolute;
          top: ${s(12)}px;
          right: ${s(12)}px;
          z-index: 2;
          padding: ${s(8)}px ${s(10)}px;
          border-radius: ${s(999)}px;
          background: rgba(17, 24, 39, 0.78);
          color: #ffffff;
          font-size: ${s(12)}px;
          line-height: 1;
          pointer-events: none;
        }
      `}</ScopedStyle>
      {measurementLabel && <div className="cmp-measurement-overlay">{measurementLabel}</div>}
      <div className="cmp-root">{state.heading}</div>
    </div>
  )
}
```

Replace the `cmp-` prefix with a short identifier for the current component, and keep all component CSS in a single `<ScopedStyle>` block.

## UI component notes

- `TextInput`, `NumberInput`, `ColorPicker`, `FontSelector`, `SvgPicker`, `ImagePicker`, and `Dropdown` receive the new value directly in `onChange` unless an existing component in this repository clearly uses event-based values.
- `Checkbox` receives a boolean directly in `onChange`.
- `Dropdown` options may use `{ value, text }` or `{ value, label }`; preserve the convention used in the existing component.
- `Button` requires a `style` prop.
- `DrawerSection` is mandatory inside `Drawer`.

## Shadow color helper

Copy this into `live.js` only when shadow is needed. Do not call `s()` inside it.

```js
function resolveShadowColor(color, opacity) {
  const normalizedColor = String(color || '').trim()
  if (!normalizedColor) return `rgba(0, 0, 0, ${opacity})`
  if (!normalizedColor.startsWith('#')) return normalizedColor
  const normalizedHex = normalizedColor.replace('#', '')
  if (![3, 6].includes(normalizedHex.length)) return `rgba(0, 0, 0, ${opacity})`
  const expandedHex = normalizedHex.length === 3
    ? normalizedHex.split('').map(value => `${value}${value}`).join('')
    : normalizedHex
  const red = parseInt(expandedHex.slice(0, 2), 16)
  const green = parseInt(expandedHex.slice(2, 4), 16)
  const blue = parseInt(expandedHex.slice(4, 6), 16)
  if ([red, green, blue].some(value => Number.isNaN(value))) return `rgba(0, 0, 0, ${opacity})`
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}
```
