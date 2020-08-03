import React from 'react'
import { GAMEMENU, GameMenuContext } from '../Reducer'
import Credits from './Credits'

/**
 * Wrapper of players component to handle with state from context
 */
export default function CreditsWrapper() {
  const { state: {
    [GAMEMENU.CREDITS]: props
  } } = React.useContext(GameMenuContext)

  return <Credits {...props}/>
}