import React from 'react'
import History from './History'
import { GAMEMENU, GameMenuContext } from '../Reducer'

/**
 * Wrapper of history component to handle with state from context
 */
export default function HistoryWrapper() {
  const { state: {
    [GAMEMENU.HISTORY]: props
  } } = React.useContext(GameMenuContext)

  return <History {...props} />
}