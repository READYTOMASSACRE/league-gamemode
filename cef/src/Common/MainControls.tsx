import React from 'react'
import Controls, { Control } from './Controls'
import { MSG } from '../messages'
import { register } from 'rage-rpc'
import { RPC_DIALOG } from '../events'

const controls: Control[] = [
  {
    input: ['`'],
    label: MSG.CONTROL_SCOREBOARD
  },
  {
    input: ['F2'],
    label: MSG.CONTROL_GAMEMENU
  },
  {
    input: ['F4'],
    label: MSG.CONTROL_TEAMCHANGE
  },
]

/**
 * Main control hud element
 */
export default function MainControls() {
  const [render, setRender] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setRender(true)
    if (!render) {
      register(RPC_DIALOG.CLIENT_CONTROLS_TOGGLE, ([ toggle ]) => setOpen(toggle))
    }
  }, [render, open])

  return <Controls
    open={open}
    style={{
      position: 'absolute',
      left: '30vmin',
      bottom: '5vmin',
    }}
    controls={controls}
    direction="vertical"
    variant="bordered"
    size="small"
  />
}