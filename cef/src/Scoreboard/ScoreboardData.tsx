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
  const [open, setOpen] = React.useState(false)
  const [rendered, setRendered] = React.useState(false)
  const [data, setData] = React.useState({})

  // effect hook to register rpc calls
  React.useEffect(() => {
    setRendered(true)
    if (!rendered) {
      register(RPC_DIALOG.CLIENT_SCOREBOARD_OPEN, () => setOpen(true))
      register(RPC_DIALOG.CLIENT_SCOREBOARD_CLOSE, () => setOpen(false))
      register(RPC_DIALOG.CLIENT_SCOREBOARD_DATA, (data: any[]) => {
        const [ props ] = data
        setData(props)
      })
    }
  }, [rendered])

  // pass the new data into props
  const props = { ...defaultProps, ...data }

  // render Scoreboard
  return <Scoreboard open={open} {...props} />
}