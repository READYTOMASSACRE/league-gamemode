import React from 'react'
import Players from './Players'
import { GAMEMENU, GameMenuContext } from '../Reducer'

/**
 * Wrapper of players component to handle with state from context
 */
export default function PlayersWrapper() {
  const { state: {
    [GAMEMENU.PLAYERS]: props
  } } = React.useContext(GameMenuContext)

  return <Players {...props} />
}