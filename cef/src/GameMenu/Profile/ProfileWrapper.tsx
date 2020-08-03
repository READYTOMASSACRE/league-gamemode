import React from 'react'
import Profile from './Profile'
import { GAMEMENU, GameMenuContext } from '../Reducer'

/**
 * Wrapper of profile component to handle with state from context
 */
export default function ProfileWrapper() {
  const { state: {
    [GAMEMENU.PROFILE]: props
  } } = React.useContext(GameMenuContext)

  return <Profile {...props}/>
}