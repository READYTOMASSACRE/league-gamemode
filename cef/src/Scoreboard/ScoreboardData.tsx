import React from 'react'
import Scoreboard from './Scoreboard'
import { register } from 'rage-rpc'
import { RPC_DIALOG } from '../events'

const defaultTeam = {
  name: "Unknown team",
  color: "white",
  players: [],
  score: 0,
}

const defaultProps = {
  motd: "Unknown",
  team: {
    ATTACKERS: defaultTeam,
    DEFENDERS: defaultTeam,
  }
}

export default function ScoreboardData() {
  // register setState handlers
  const [open, setOpen]       = React.useState(false)
  const [render, setRender]   = React.useState(false)
  const [props, setProps]     = React.useState({})

  const initData = () => {
    if (render) return

    setRender(true)
    register(RPC_DIALOG.CLIENT_SCOREBOARD_TOGGLE, ([ toggle ]) => setOpen(toggle))
    register(RPC_DIALOG.CLIENT_SCOREBOARD_DATA, ([ props ]) => setProps(props))
  }

  // effect hook to register rpc calls
  React.useEffect(initData, [render])

  // render Scoreboard
  return <Scoreboard open={open} {...{...defaultProps, ...props}} />
}