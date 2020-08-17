import React from 'react'
import Players from './Players'
import { GAMEMENU, GameMenuContext } from '../Reducer'

interface TopPlayersWrapperProps {
  onRefresh?: (...args: any[]) => void
}

/**
 * Wrapper of players component to handle with state from context
 */
export default function TopPlayersWrapper({ onRefresh }: TopPlayersWrapperProps) {
  const { state: {
    [GAMEMENU.TOP]: props
  } } = React.useContext(GameMenuContext)

  return <Players onRefresh={onRefresh} {...props} />
}