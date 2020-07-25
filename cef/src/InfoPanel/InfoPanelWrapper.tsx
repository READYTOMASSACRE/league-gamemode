import React from 'react'
import InfoPanel from './InfoPanel'
import { RPC_DIALOG } from '../events'
import { register } from 'rage-rpc'

const defaultTeam = {
  name: 'unknown',
  color: 'white',
  players: []
}
const defaultTeams = {
  ATTACKERS: defaultTeam,
  DEFENDERS: defaultTeam,
}

const defaultProps = {
  time: '00:00',
  arena: 'unknown',
  team: defaultTeams
}

/**
 * Wrapper for top round panel
 */
export default function InfoPanelWrapper() {
  // register setState handlers
  const [open, setOpen]       = React.useState(false)
  const [render, setRender]   = React.useState(false)
  const [props, setProps]     = React.useState({})

  const initWrapper = () => {
    if (render) return

    setRender(true)
    register(RPC_DIALOG.CLIENT_INFOPANEL_TOGGLE, ([ toggle ]) => setOpen(toggle))
    register(RPC_DIALOG.CLIENT_INFOPANEL_DATA, ([ props ]) => setProps(props))
  }

  // effect hook to register rpc calls
  React.useEffect(initWrapper, [render])

  // render Infopanel
  return <InfoPanel open={open} {...{...defaultProps, ...props}}/>
}