FILE: /common/index.js
```javascript
export function getInitialState(state) {
  const baseState = {
    heading: 'Component Title',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Add your own content, icons, and styling to turn this into a production-ready component.',
    icons: [
      {
        id: '1',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
        color: '#2563eb'
      },
      {
        id: '2',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"></path></svg>',
        color: '#0f766e'
      },
      {
        id: '3',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"></path><path d="M7 3h10"></path><path d="M6 11h12"></path><path d="M8 15h8"></path><path d="M10 19h4"></path></svg>',
        color: '#ea580c'
      },
      {
        id: '4',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h10"></path><path d="M7 12h6"></path><path d="M7 16h8"></path></svg>',
        color: '#7c3aed'
      }
    ],
    animationType: 'pulse',
    animationRepeat: 'always',
    loadingMode: 'onLoad',
    exposeOnCardClick: false,
    exposeOnAnimationStart: false,
    exposeOnAnimationEnd: false,
    hasStartedLoading: false,
    animationRunId: 0,
    iconSize: 48,
    iconsPerRow: 4,
    iconGap: 15,
    iconHeadingGap: 20,
    hasBackground: true,
    bgColor: '#ffffff',
    cardPadding: 30,
    borderRadius: 12,
    hasShadow: true,
    shadowOnHover: false,
    shadowColor: 'rgba(15, 23, 42, 0.16)',
    shadowOffsetX: 0,
    shadowOffsetY: 12,
    shadowBlur: 32,
    shadowSpread: 0,
    hasWidthBreakpoint: false,
    widthBreakpoint: 520,
    previewWidthInLiveView: false,
    currentComponentWidth: 0,
    currentComponentHeight: 0,
    ...state
  }

  const baseFont = baseState.font ?? 'Helvetica'
  const baseTextColor = baseState.textColor ?? '#1f2937'

  return {
    ...baseState,
    headingFont: baseState.headingFont ?? baseFont,
    headingFontWeight: baseState.headingFontWeight ?? '700',
    headingFontSize: baseState.headingFontSize ?? 24,
    headingColor: baseState.headingColor ?? baseTextColor,
    descriptionFont: baseState.descriptionFont ?? baseFont,
    descriptionFontWeight: baseState.descriptionFontWeight ?? '400',
    descriptionFontSize: baseState.descriptionFontSize ?? 16,
    descriptionColor: baseState.descriptionColor ?? baseTextColor,
    font: baseFont,
    textColor: baseTextColor
  }
}
```
END

FILE: /editor/index.js
```javascript
import React, { useState } from 'react'
import {
  TextInput,
  NumberInput,
  Checkbox,
  FontSelector,
  ColorPicker,
  SvgPicker,
  Dropdown,
  Tabs,
  Tab,
  Section,
  SettingItem,
  Label,
  TableContainer,
  OptionsMenuRootButton,
  Drawer,
  DrawerSection
} from '@ui'
import { SizeType } from '@constants'
import { getUniqueId, ScopedStyle } from '@utils'
import { deleteIcon, duplicateIcon, editIcon } from '@icons'
import { getInitialState } from '@common/index'
export { getInitialState }

const fontWeightOptions = [
  { value: '100', text: 'Thin - 100' },
  { value: '200', text: 'Extra Light - 200' },
  { value: '300', text: 'Light - 300' },
  { value: '400', text: 'Regular - 400' },
  { value: '500', text: 'Medium - 500' },
  { value: '600', text: 'Semi Bold - 600' },
  { value: '700', text: 'Bold - 700' },
  { value: '800', text: 'Extra Bold - 800' },
  { value: '900', text: 'Black - 900' }
]

function Settings({ state, setState }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingIconId, setEditingIconId] = useState(null)
  const [draggedIconId, setDraggedIconId] = useState(null)
  const [dropTargetIconId, setDropTargetIconId] = useState(null)

  const handleAddIcon = () => {
    const newIcon = {
      id: getUniqueId(),
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
      color: '#2563eb'
    }
    setState({ ...state, icons: [...state.icons, newIcon] })
  }

  const handleDeleteIcon = (id) => {
    setState({ ...state, icons: state.icons.filter(icon => icon.id !== id) })
  }

  const handleDuplicateIcon = (id) => {
    const iconIndex = state.icons.findIndex(icon => icon.id === id)

    if (iconIndex === -1) {
      return
    }

    const duplicatedIcon = {
      ...state.icons[iconIndex],
      id: getUniqueId()
    }

    const nextIcons = [...state.icons]
    nextIcons.splice(iconIndex + 1, 0, duplicatedIcon)
    setState({ ...state, icons: nextIcons })
  }

  const handleEditIcon = (id) => {
    setEditingIconId(id)
    setDrawerOpen(true)
  }

  const updateEditingIcon = (updates) => {
    setState({
      ...state,
      icons: state.icons.map(icon => icon.id === editingIconId ? { ...icon, ...updates } : icon)
    })
  }

  const moveIcon = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) {
      return
    }

    const sourceIndex = state.icons.findIndex(icon => icon.id === sourceId)
    const targetIndex = state.icons.findIndex(icon => icon.id === targetId)

    if (sourceIndex === -1 || targetIndex === -1) {
      return
    }

    const nextIcons = [...state.icons]
    const [movedIcon] = nextIcons.splice(sourceIndex, 1)
    const insertIndex = sourceIndex < targetIndex ? targetIndex : targetIndex

    nextIcons.splice(insertIndex, 0, movedIcon)
    setState({ ...state, icons: nextIcons })
  }

  const handleDragStart = (iconId) => (event) => {
    setDraggedIconId(iconId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', iconId)
  }

  const handleDragOver = (iconId) => (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (iconId !== draggedIconId) {
      setDropTargetIconId(iconId)
    }
  }

  const handleDrop = (iconId) => (event) => {
    event.preventDefault()
    const sourceId = draggedIconId || event.dataTransfer.getData('text/plain')

    moveIcon(sourceId, iconId)
    setDraggedIconId(null)
    setDropTargetIconId(null)
  }

  const handleDragEnd = () => {
    setDraggedIconId(null)
    setDropTargetIconId(null)
  }

  const editingIcon = state.icons.find(icon => icon.id === editingIconId)

  const styles = `
    .cmp-settings-section-heading {
      margin: 0 0 12px 0;
      color: #000000;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .cmp-icon-drag-handle {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: grab;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      -webkit-appearance: none;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .icon-drag-handle:active {
      cursor: grabbing;
    }

    .icon-drag-grip {
      width: 12px;
      height: 18px;
      display: block;
      border-radius: 999px;
      background-image:
        radial-gradient(circle, currentColor 1.2px, transparent 1.3px),
        radial-gradient(circle, currentColor 1.2px, transparent 1.3px);
      background-size: 6px 6px;
      background-position: left top, right top;
      background-repeat: repeat-y;
      pointer-events: none;
    }

    .icon-row-drop-target {
      border-radius: 6px;
      outline: 1px dashed #9ca3af;
      outline-offset: 4px;
    }

    .editor-icon-preview svg *[fill]:not([fill="none"]) {
      fill: currentColor !important;
    }

    .editor-icon-preview svg *[stroke]:not([stroke="none"]) {
      stroke: currentColor !important;
    }

    .editor-icon-preview svg path:not([fill="none"]):not([stroke]),
    .editor-icon-preview svg circle:not([fill="none"]):not([stroke]),
    .editor-icon-preview svg rect:not([fill="none"]):not([stroke]),
    .editor-icon-preview svg polygon:not([fill="none"]):not([stroke]) {
      fill: currentColor !important;
    }

    .settings-note-banner {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px;
      border-radius: 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 13px;
      line-height: 1.45;
    }

  `

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <Tabs defaultActiveTab="content">
        <Tab id="content" title="Content">
          <Section>
            <SettingItem>
              <Label content="Heading" />
              <TextInput
                value={state.heading}
                onChange={e => setState({ ...state, heading: e.currentTarget.value })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Description" />
              <TextInput
                value={state.description}
                onChange={e => setState({ ...state, description: e.currentTarget.value })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Icons" />
              <TableContainer
                addButtonText="Add Icon"
                emptyMessage="No icons added."
                columns={[
                  { content: '', compact: true },
                  { content: 'Icon' },
                  { content: '', compact: true }
                ]}
                onAdd={handleAddIcon}
                rows={state.icons.map((icon) => [
                  <button
                    type="button"
                    className={`icon-drag-handle ${dropTargetIconId === icon.id ? 'icon-row-drop-target' : ''}`}
                    draggable
                    onDragStart={handleDragStart(icon.id)}
                    onDragOver={handleDragOver(icon.id)}
                    onDrop={handleDrop(icon.id)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <span className="icon-drag-grip" />
                  </button>,
                  <div
                    className={`editor-icon-preview ${dropTargetIconId === icon.id ? 'icon-row-drop-target' : ''}`}
                    style={{ width: '24px', height: '24px', color: icon.color }}
                    onDragOver={handleDragOver(icon.id)}
                    onDrop={handleDrop(icon.id)}
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />,
                  <OptionsMenuRootButton
                    key={icon.id}
                    options={[
                      {
                        text: 'Edit',
                        tip: 'Edit this icon',
                        icon: editIcon,
                        type: 'onClick',
                        onClick: () => handleEditIcon(icon.id)
                      },
                      {
                        text: 'Duplicate',
                        tip: 'Duplicate this icon',
                        icon: duplicateIcon,
                        type: 'onClick',
                        onClick: () => handleDuplicateIcon(icon.id)
                      },
                      {
                        text: 'Delete',
                        tip: 'Delete this icon',
                        icon: deleteIcon,
                        type: 'onClick',
                        onClick: () => handleDeleteIcon(icon.id)
                      }
                    ]}
                  />
                ])}
              />
            </SettingItem>
            <SettingItem>
              <div className="settings-note-banner">
                Current layout is {state.iconsPerRow} {state.iconsPerRow === 1 ? 'icon' : 'icons'} per row. To change it, go to the Styles tab.
              </div>
            </SettingItem>
          </Section>
        </Tab>
        <Tab id="style" title="Styles">
          <Section>
            <div className="cmp-settings-section-heading">Heading</div>
            <SettingItem>
              <Label content="Font" />
              <FontSelector
                value={state.headingFont}
                onChange={headingFont => setState({ ...state, headingFont })}
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Weight"
                help="These are font weights. Some selected fonts may not include every weight shown in this dropdown."
              />
              <Dropdown
                value={state.headingFontWeight}
                options={fontWeightOptions}
                onChange={headingFontWeight => setState({ ...state, headingFontWeight })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Size" />
              <NumberInput
                value={state.headingFontSize}
                min={10}
                max={72}
                step={1}
                onChange={headingFontSize => setState({ ...state, headingFontSize })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Color" />
              <ColorPicker
                value={state.headingColor}
                onChange={headingColor => setState({ ...state, headingColor })}
              />
            </SettingItem>
          </Section>
          <Section>
            <div className="cmp-settings-section-heading">Description</div>
            <SettingItem>
              <Label content="Font" />
              <FontSelector
                value={state.descriptionFont}
                onChange={descriptionFont => setState({ ...state, descriptionFont })}
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Weight"
                help="These are font weights. Some selected fonts may not include every weight shown in this dropdown."
              />
              <Dropdown
                value={state.descriptionFontWeight}
                options={fontWeightOptions}
                onChange={descriptionFontWeight => setState({ ...state, descriptionFontWeight })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Size" />
              <NumberInput
                value={state.descriptionFontSize}
                min={10}
                max={48}
                step={1}
                onChange={descriptionFontSize => setState({ ...state, descriptionFontSize })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Color" />
              <ColorPicker
                value={state.descriptionColor}
                onChange={descriptionColor => setState({ ...state, descriptionColor })}
              />
            </SettingItem>
          </Section>
          <Section>
            <div className="cmp-settings-section-heading">Card</div>
            <SettingItem>
              <Checkbox
                value={state.hasBackground}
                onChange={hasBackground => setState({ ...state, hasBackground })}
                label="Show background"
              />
            </SettingItem>
            {state.hasBackground && (
              <>
                <SettingItem>
                  <Label content="Color" />
                  <ColorPicker
                    value={state.bgColor}
                    onChange={bgColor => setState({ ...state, bgColor })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Padding" />
                  <NumberInput
                    value={state.cardPadding}
                    min={0}
                    max={120}
                    step={1}
                    onChange={cardPadding => setState({ ...state, cardPadding })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Corner Radius" />
                  <NumberInput
                    value={state.borderRadius}
                    min={0}
                    max={80}
                    step={1}
                    onChange={borderRadius => setState({ ...state, borderRadius })}
                  />
                </SettingItem>
              </>
            )}
            <SettingItem>
              <Checkbox
                value={state.hasShadow}
                onChange={hasShadow => setState({ ...state, hasShadow })}
                label="Show shadow"
              />
            </SettingItem>
            {state.hasShadow && (
              <>
                <SettingItem>
                  <Checkbox
                    value={state.shadowOnHover}
                    onChange={shadowOnHover => setState({ ...state, shadowOnHover })}
                    label="Show shadow on hover"
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Color" />
                  <ColorPicker
                    value={state.shadowColor}
                    onChange={shadowColor => setState({ ...state, shadowColor })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Horizontal Offset" />
                  <NumberInput
                    value={state.shadowOffsetX}
                    min={-100}
                    max={100}
                    step={1}
                    onChange={shadowOffsetX => setState({ ...state, shadowOffsetX })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Vertical Offset" />
                  <NumberInput
                    value={state.shadowOffsetY}
                    min={-100}
                    max={100}
                    step={1}
                    onChange={shadowOffsetY => setState({ ...state, shadowOffsetY })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Shadow Blur" />
                  <NumberInput
                    value={state.shadowBlur}
                    min={0}
                    max={120}
                    step={1}
                    onChange={shadowBlur => setState({ ...state, shadowBlur })}
                  />
                </SettingItem>
                <SettingItem>
                  <Label content="Shadow Spread" />
                  <NumberInput
                    value={state.shadowSpread}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={shadowSpread => setState({ ...state, shadowSpread })}
                  />
                </SettingItem>
              </>
            )}
          </Section>
          <Section>
            <div className="cmp-settings-section-heading">Icons</div>
            <SettingItem>
              <Label content="Size" />
              <NumberInput
                value={state.iconSize}
                min={16}
                max={160}
                step={1}
                onChange={iconSize => setState({ ...state, iconSize })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Per Row" />
              <NumberInput
                value={state.iconsPerRow}
                min={1}
                max={8}
                step={1}
                onChange={iconsPerRow => setState({ ...state, iconsPerRow })}
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Bottom Margin"
                help="This controls the space between the icon group and the heading."
              />
              <NumberInput
                value={state.iconHeadingGap}
                min={0}
                max={120}
                step={1}
                onChange={iconHeadingGap => setState({ ...state, iconHeadingGap })}
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Icon Gap"
                help="This controls the gap between icons within the icon grid."
              />
              <NumberInput
                value={state.iconGap}
                min={0}
                max={120}
                step={1}
                onChange={iconGap => setState({ ...state, iconGap })}
              />
            </SettingItem>
          </Section>
        </Tab>
        <Tab id="animation" title="Animation">
          <Section>
            <div className="cmp-settings-section-heading">Motion</div>
            <SettingItem>
              <Label
                content="Type"
                help="Choose a sequential animation that runs from the first icon to the last icon."
              />
              <Dropdown
                value={state.animationType}
                options={[
                  { value: 'none', text: 'None' },
                  { value: 'pulse', text: 'Pulse' },
                  { value: 'bounce', text: 'Bounce' }
                ]}
                onChange={animationType => setState({ ...state, animationType })}
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Repeat"
                help="Choose whether each icon animation should play once or continue looping."
              />
              <Dropdown
                value={state.animationRepeat}
                options={[
                  { value: 'once', text: 'Once' },
                  { value: 'always', text: 'Always' }
                ]}
                onChange={animationRepeat => setState({ ...state, animationRepeat })}
              />
            </SettingItem>
          </Section>
          <Section>
            <div className="cmp-settings-section-heading">Animation Trigger</div>
            <SettingItem>
              <Label
                content="Start Mode"
                help="Choose whether the animation starts automatically when the component renders or only after the Start Animation action is triggered."
              />
              <Dropdown
                value={state.loadingMode}
                options={[
                  { value: 'onLoad', text: 'On Load' },
                  { value: 'manual', text: 'Manual' }
                ]}
                onChange={loadingMode => setState({
                  ...state,
                  loadingMode,
                  hasStartedLoading: loadingMode === 'onLoad'
                })}
              />
            </SettingItem>
            {state.loadingMode === 'manual' && (
              <SettingItem>
                <div className="settings-note-banner">
                  The action "Start Animation" is now enabled and can be found when selecting a component to add an action.
                </div>
              </SettingItem>
            )}
            <SettingItem>
              <Label
                content="Expose Triggers"
                help="Triggers are outbound events. Enable the ones you want this component to expose so external logic can react when those events happen."
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                value={state.exposeOnCardClick}
                onChange={exposeOnCardClick => setState({ ...state, exposeOnCardClick })}
                label="On Card Click"
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                value={state.exposeOnAnimationStart}
                onChange={exposeOnAnimationStart => setState({ ...state, exposeOnAnimationStart })}
                label="On Animation Start"
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                value={state.exposeOnAnimationEnd}
                onChange={exposeOnAnimationEnd => setState({ ...state, exposeOnAnimationEnd })}
                label="On Animation End"
              />
            </SettingItem>
          </Section>
        </Tab>
        <Tab id="advanced" title="Advanced">
          <Section>
            <div className="cmp-settings-section-heading">Responsive Width</div>
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
                  <Label
                    content="Breakpoint Width"
                    help="When the component width reaches this value or below, it switches to a more compact layout."
                  />
                  <NumberInput
                    value={state.widthBreakpoint}
                    min={120}
                    max={2000}
                    step={1}
                    onChange={widthBreakpoint => setState({ ...state, widthBreakpoint })}
                  />
                </SettingItem>
                <SettingItem>
                  <Checkbox
                    value={state.previewWidthInLiveView}
                    onChange={previewWidthInLiveView => setState({ ...state, previewWidthInLiveView })}
                    label="Preview current width in live view"
                  />
                </SettingItem>
              </>
            )}
          </Section>
        </Tab>
      </Tabs>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Icon"
      >
        {editingIcon && (
          <DrawerSection>
            <SettingItem>
              <Label content="Icon SVG" />
              <SvgPicker
                value={editingIcon.svg}
                onChange={svg => updateEditingIcon({ svg })}
              />
            </SettingItem>
            <SettingItem>
              <Label content="Icon Color" />
              <ColorPicker
                value={editingIcon.color}
                onChange={color => updateEditingIcon({ color })}
              />
            </SettingItem>
          </DrawerSection>
        )}
      </Drawer>
    </>
  )
}

export function getSettings(state) {
  return {
    settings: {
      name: 'Boilerplate Card Settings',
      Setting: Settings,
      width: 500,
      help: () => ({
        title: 'Boilerplate Card Help',
        content: (
          <>
            <h1>Boilerplate Card Component</h1>
            <p>This starter component includes a heading, description, and a managed SVG icon list that you can reorder, duplicate, edit, and style.</p>
            <p>Use the Content tab to change copy and manage icons, the Styles tab to adjust typography and card styling, the Animation tab to define how icons animate and which animation triggers are exposed, and the Advanced tab for responsive width behavior.</p>
            <p>Responsive Width uses the component's own width as the breakpoint trigger rather than the page or viewport width. When the component narrows to or below the breakpoint, it automatically switches from resizable height to content-based height and applies a compact layout.</p>
            <p>Animation can either start automatically on load or be started manually. When Start Mode is set to Manual in the Animation tab, the Start Animation action can be used to trigger the icon sequence at any time. You can also choose whether On Animation Start and On Animation End are exposed for external use.</p>
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
  return {
    startAnimation: {
      name: 'Start Animation',
      info: { text: 'Starts the animation when start mode is set to manual' },
      state: {},
      Setting() {
        return null
      }
    }
  }
}

export function getTriggers(state) {
  return {
    ...(state.exposeOnCardClick ? { onCardClick: { name: 'On Card Click' } } : {}),
    ...(state.exposeOnAnimationStart ? { onAnimationStart: { name: 'On Animation Start' } } : {}),
    ...(state.exposeOnAnimationEnd ? { onAnimationEnd: { name: 'On Animation End' } } : {})
  }
}

export function getFonts(state) {
  return [state.headingFont, state.descriptionFont].filter(Boolean)
}

export function getSizeTypes(state) {
  const isNarrow = Boolean(state.hasWidthBreakpoint) && Number(state.currentComponentWidth) > 0 && Number(state.currentComponentWidth) <= Math.max(120, Number(state.widthBreakpoint) || 120)
  const needsResizableHeight = Boolean(state.hasWidthBreakpoint) && !isNarrow
  return {
    width: SizeType.RESIZABLE,
    height: needsResizableHeight ? SizeType.RESIZABLE : SizeType.CONTENT_BASED
  }
}

export function getLiveState(state) {
  return state
}
```
END

FILE: /live/index.js
```javascript
// HEIGHT PATTERN: CONTENT_BASED | RESIZABLE | BREAKPOINT_AWARE
// Change this comment when the pattern changes so the agent reads it correctly.
// HEIGHT_PATTERN: CONTENT_BASED

import React, { useEffect, useRef, useState } from 'react'
import { ScopedStyle } from '@utils'
import { useScaler } from '@hooks'
import { getInitialState } from '@common/index'
export { getInitialState }

export function getActionHandlers() {
  return {
    async startAnimation({ setComponentState }) {
      setComponentState(prev => ({
        ...prev,
        hasStartedLoading: true,
        animationRunId: (prev.animationRunId ?? 0) + 1
      }))
    }
  }
}

function resolveShadowColor(color, opacity) {
  const normalizedColor = String(color || '').trim()

  if (!normalizedColor) {
    return 'rgba(0, 0, 0, 0.18)'
  }

  if (!normalizedColor.startsWith('#')) {
    return normalizedColor
  }

  const normalizedHex = normalizedColor.replace('#', '')

  if (![3, 6].includes(normalizedHex.length)) {
    return `rgba(0, 0, 0, ${opacity})`
  }

  const expandedHex = normalizedHex.length === 3
    ? normalizedHex.split('').map(value => `${value}${value}`).join('')
    : normalizedHex

  const red = parseInt(expandedHex.slice(0, 2), 16)
  const green = parseInt(expandedHex.slice(2, 4), 16)
  const blue = parseInt(expandedHex.slice(4, 6), 16)

  if ([red, green, blue].some(value => Number.isNaN(value))) {
    return `rgba(0, 0, 0, ${opacity})`
  }

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function getMeasuredSize(element) {
  return {
    width: Math.max(0, element.clientWidth),
    height: Math.max(0, element.clientHeight)
  }
}

export function Component({ state, setState, saveAudienceData, runTrigger }) {
  const { s } = useScaler()
  const previousLoadingMode = useRef(state.loadingMode)
  const previousAnimationActive = useRef(false)
  const completedAnimationRunId = useRef(null)
  const containerRef = useRef(null)
  const platformHeightRef = useRef(null)
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const containerElement = containerRef.current

    if (!containerElement) {
      return undefined
    }

    const resizeObserverConstructor = typeof window !== 'undefined' ? window.ResizeObserver : undefined

    const syncMeasuredSize = (width, height) => {
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)

      setMeasuredSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev
        }

        return {
          width: nextWidth,
          height: nextHeight
        }
      })

      setState((prev) => {
        if (prev.currentComponentWidth === nextWidth && prev.currentComponentHeight === nextHeight) {
          return prev
        }

        return {
          ...prev,
          currentComponentWidth: nextWidth,
          currentComponentHeight: nextHeight
        }
      })
    }

    const measureNow = () => {
      const measuredSize = getMeasuredSize(containerElement)
      syncMeasuredSize(measuredSize.width, measuredSize.height)
    }

    measureNow()

    let observer
    let intervalId
    let frameId
    let secondFrameId

    if (resizeObserverConstructor) {
      observer = new resizeObserverConstructor((entries) => {
        const nextEntry = entries[0]

        if (!nextEntry) {
          return
        }

        const measuredSize = getMeasuredSize(containerElement)
        syncMeasuredSize(measuredSize.width, measuredSize.height)
      })

      observer.observe(containerElement)
    } else {
      intervalId = window.setInterval(measureNow, 250)
    }

    frameId = window.requestAnimationFrame(measureNow)
    secondFrameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measureNow)
    })

    return () => {
      if (typeof frameId === 'number') {
        window.cancelAnimationFrame(frameId)
      }

      if (typeof secondFrameId === 'number') {
        window.cancelAnimationFrame(secondFrameId)
      }

      if (typeof intervalId === 'number') {
        window.clearInterval(intervalId)
      }

      if (observer) {
        observer.disconnect()
      }
    }
  }, [setState])

  useEffect(() => {
    const switchedToManual = previousLoadingMode.current !== 'manual' && state.loadingMode === 'manual'

    previousLoadingMode.current = state.loadingMode

    if (state.loadingMode === 'onLoad' && !state.hasStartedLoading) {
      setState(prev => ({
        ...prev,
        hasStartedLoading: true,
        animationRunId: prev.animationRepeat === 'once' ? (prev.animationRunId ?? 0) + 1 : prev.animationRunId
      }))
    }

    if (switchedToManual && state.hasStartedLoading) {
      setState(prev => ({ ...prev, hasStartedLoading: false }))
    }
  }, [state.loadingMode, state.hasStartedLoading, setState])

  const isLoadingActive = state.loadingMode === 'onLoad' || state.hasStartedLoading
  const animationIterationCount = state.animationRepeat === 'once' ? '1' : 'infinite'
  const sequentialDelayStep = s(180) / 1000
  const liveMeasuredWidth = Math.max(0, Number(measuredSize.width) || 0)
  const liveMeasuredHeight = Math.max(0, Number(measuredSize.height) || 0)
  const measuredWidth = Math.max(0, liveMeasuredWidth || Number(state.currentComponentWidth) || 0)
  const responsiveBreakpointWidth = Math.max(120, Number(state.widthBreakpoint) || 120)
  const isCompactLayout = Boolean(state.hasWidthBreakpoint) && measuredWidth > 0 && measuredWidth <= responsiveBreakpointWidth
  const baseIconsPerRow = Math.max(1, Number(state.iconsPerRow) || 1)
  const iconsPerRow = isCompactLayout
    ? Math.max(2, Math.min(baseIconsPerRow, 2))
    : baseIconsPerRow
  const visibleIconsPerRow = Math.max(1, Math.min(iconsPerRow, state.icons.length || 1))
  const iconSize = Math.max(16, Number(state.iconSize) || 48)
  const iconGap = Math.max(0, Number(state.iconGap) || 0)
  const iconHeadingGap = Math.max(0, Number(state.iconHeadingGap) || 0)
  const cardPadding = Math.max(0, Number(state.cardPadding) || 0)
  const borderRadius = Math.max(0, Number(state.borderRadius) || 0)
  const shadowOffsetX = Number(state.shadowOffsetX) || 0
  const shadowOffsetY = Number(state.shadowOffsetY) || 0
  const shadowBlur = Math.max(0, Number(state.shadowBlur) || 0)
  const shadowSpread = Number(state.shadowSpread) || 0
  const legacyShadowOpacity = Math.min(1, Math.max(0, Number(state.shadowOpacity) || 0.18))
  const boxShadow = state.hasShadow
    ? `${s(shadowOffsetX)}px ${s(shadowOffsetY)}px ${s(shadowBlur)}px ${s(shadowSpread)}px ${resolveShadowColor(state.shadowColor, legacyShadowOpacity)}`
    : 'none'
  const restingBoxShadow = state.hasShadow && !state.shadowOnHover ? boxShadow : 'none'
  const hoverBoxShadow = state.hasShadow && state.shadowOnHover ? boxShadow : restingBoxShadow
  const shouldPreviewWidth = Boolean(state.previewWidthInLiveView)
  const measurementLabel = shouldPreviewWidth ? `Width: ${liveMeasuredWidth || 0}px` : ''

  // Imperatively force the outer dot-component wrapper to height: auto when we are in
  // content-based mode. getSizeTypes signals the framework, but its update may lag behind
  // the resize event, leaving the old fixed pixel height on the platform container.
  const needsAutoHeight = !Boolean(state.hasWidthBreakpoint) || isCompactLayout
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let ancestor = el.parentElement
    while (ancestor) {
      if (ancestor.classList && ancestor.classList.contains('dot-component')) {
        if (needsAutoHeight) {
          // Save the platform's pixel height before overriding so we can restore it later
          const currentHeight = ancestor.style.height
          if (currentHeight && currentHeight !== 'auto') {
            platformHeightRef.current = currentHeight
          }
          ancestor.style.height = 'auto'
        } else {
          // Restore the platform's original pixel height
          if (platformHeightRef.current) {
            ancestor.style.height = platformHeightRef.current
          }
        }
        break
      }
      ancestor = ancestor.parentElement
    }
  }, [needsAutoHeight])

  const styles = `
    .cmp-card-container {
      position: relative;
      width: 100%;
      height: ${(Boolean(state.hasWidthBreakpoint) && !isCompactLayout) ? '100%' : 'auto'};
      box-sizing: border-box;
      padding: ${s(isCompactLayout ? Math.max(16, cardPadding * 0.7) : cardPadding)}px;
      background-color: ${state.hasBackground ? state.bgColor : 'transparent'};
      border-radius: ${state.hasBackground ? s(borderRadius) : 0}px;
      box-shadow: ${restingBoxShadow};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .cmp-measurement-overlay {
      position: absolute;
      top: ${s(12)}px;
      right: ${s(12)}px;
      z-index: 2;
      box-sizing: border-box;
      padding: ${s(8)}px ${s(10)}px;
      border-radius: ${s(999)}px;
      background: rgba(17, 24, 39, 0.78);
      color: #ffffff;
      font-size: ${s(12)}px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.02em;
      pointer-events: none;
      backdrop-filter: blur(${s(8)}px);
      -webkit-backdrop-filter: blur(${s(8)}px);
      box-shadow: 0 ${s(6)}px ${s(18)}px rgba(15, 23, 42, 0.18);
      white-space: nowrap;
    }

    .cmp-card-container:hover {
      transform: translateY(-${s(4)}px);
      box-shadow: ${hoverBoxShadow};
    }

    .cmp-icons-container {
      display: grid;
      grid-template-columns: repeat(${visibleIconsPerRow}, minmax(0, max-content));
      column-gap: ${s(isCompactLayout ? Math.max(8, iconGap * 0.8) : iconGap)}px;
      row-gap: ${s(isCompactLayout ? Math.max(8, iconGap * 0.8) : iconGap)}px;
      margin-bottom: ${s(iconHeadingGap)}px;
      justify-content: center;
      justify-items: center;
      width: 100%;
      box-sizing: border-box;
    }

    .cmp-icon-wrapper {
      width: ${s(iconSize)}px;
      height: ${s(iconSize)}px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
    }

    .cmp-icon-wrapper svg {
      width: 100%;
      height: 100%;
    }

    .cmp-icon-wrapper svg *[fill]:not([fill="none"]) {
      fill: currentColor !important;
    }

    .cmp-icon-wrapper svg *[stroke]:not([stroke="none"]) {
      stroke: currentColor !important;
    }

    .cmp-icon-wrapper svg path:not([fill="none"]):not([stroke]),
    .cmp-icon-wrapper svg circle:not([fill="none"]):not([stroke]),
    .cmp-icon-wrapper svg rect:not([fill="none"]):not([stroke]),
    .cmp-icon-wrapper svg polygon:not([fill="none"]):not([stroke]) {
      fill: currentColor !important;
    }

    .cmp-heading {
      font-family: ${state.headingFont};
      font-size: ${s(isCompactLayout ? Math.max(16, state.headingFontSize - 2) : state.headingFontSize)}px;
      font-weight: ${state.headingFontWeight};
      color: ${state.headingColor};
      margin: 0 0 ${s(12)}px 0;
      line-height: 1.3;
    }

    .cmp-description {
      font-family: ${state.descriptionFont};
      font-size: ${s(isCompactLayout ? Math.max(14, state.descriptionFontSize - 1) : state.descriptionFontSize)}px;
      font-weight: ${state.descriptionFontWeight};
      color: ${state.descriptionColor};
      opacity: 0.8;
      margin: 0;
      line-height: 1.5;
    }

    .cmp-anim-pulse {
      animation-name: pulse;
      animation-duration: 1.2s;
      animation-timing-function: ease-in-out;
      animation-iteration-count: var(--animation-iteration-count);
      animation-delay: var(--animation-delay);
      animation-fill-mode: both;
    }

    .cmp-anim-bounce {
      animation-name: bounce;
      animation-duration: 1.2s;
      animation-timing-function: ease-in-out;
      animation-iteration-count: var(--animation-iteration-count);
      animation-delay: var(--animation-delay);
      animation-fill-mode: both;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.16); }
      100% { transform: scale(1); }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      30% { transform: translateY(-${s(18)}px); }
      55% { transform: translateY(${s(4)}px); }
      75% { transform: translateY(-${s(8)}px); }
    }
  `

  const animationClass = state.animationType !== 'none' ? `cmp-anim-${state.animationType}` : ''

  useEffect(() => {
    const didAnimationStart = !previousAnimationActive.current && isLoadingActive && state.animationType !== 'none'

    previousAnimationActive.current = isLoadingActive

    if (didAnimationStart && state.exposeOnAnimationStart) {
      runTrigger('onAnimationStart')
    }
  }, [isLoadingActive, runTrigger, state.animationType, state.exposeOnAnimationStart])

  const handleAnimationEnd = (iconIndex) => {
    if (!state.exposeOnAnimationEnd || state.animationType === 'none' || state.animationRepeat !== 'once') {
      return
    }

    if (iconIndex !== state.icons.length - 1) {
      return
    }

    const currentRunId = state.animationRunId ?? 0

    if (completedAnimationRunId.current === currentRunId) {
      return
    }

    completedAnimationRunId.current = currentRunId
    runTrigger('onAnimationEnd')
  }

  const handleCardClick = () => {
    if (!state.exposeOnCardClick) {
      return
    }

    runTrigger('onCardClick')
  }

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div ref={containerRef} className="cmp-card-container" onClick={handleCardClick}>
        {measurementLabel && <div className="cmp-measurement-overlay">{measurementLabel}</div>}
        {state.icons && state.icons.length > 0 && (
          <div className="cmp-icons-container">
            {state.icons.map((icon, index) => (
              <div
                key={`${icon.id}-${state.animationRepeat === 'once' ? state.animationRunId ?? 0 : 'loop'}`}
                className={`cmp-icon-wrapper ${isLoadingActive ? animationClass : ''}`}
                style={{
                  color: icon.color,
                  '--animation-iteration-count': animationIterationCount,
                  '--animation-delay': `${index * sequentialDelayStep}s`
                }}
                onAnimationEnd={() => handleAnimationEnd(index)}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
            ))}
          </div>
        )}
        <h2 className="cmp-heading">{state.heading}</h2>
        <p className="cmp-description">{state.description}</p>
      </div>
    </>
  )
}
```
END