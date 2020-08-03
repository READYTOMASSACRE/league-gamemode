import React from 'react'
import Vote from './Vote'
import { GAMEMENU, GameMenuContext } from '../Reducer'

/**
 * Wrapper of vote component to handle with state from context
 */
export default function VoteWrapper() {
  const { state: {
    [GAMEMENU.VOTE]: props
  } } = React.useContext(GameMenuContext)

  return <Vote {...props} />
}