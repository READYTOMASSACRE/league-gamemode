import React from 'react'
import { ProfileProps } from './Profile/Profile'
import { PlayersProps } from './Players/Players'
import { HistoryProps } from './History/History'
import { VoteProps } from './Vote/Vote'
import { CreditsProps } from './Credits/Credits'

export enum GAMEMENU {
  PROFILE,
  PLAYERS,
  HISTORY,
  VOTE,
  TOP,
  CREDITS,
}

export type GameMenuState = {
  [GAMEMENU.PROFILE]    : ProfileProps,
  [GAMEMENU.PLAYERS]    : PlayersProps,
  [GAMEMENU.HISTORY]    : HistoryProps,
  [GAMEMENU.VOTE]       : VoteProps,
  [GAMEMENU.TOP]        : PlayersProps,
  [GAMEMENU.CREDITS]    : CreditsProps,
}

export type GameMenuAction = {
  type: GAMEMENU
  payload: any
}

/**
 * Initial state
 */
export const initialState: GameMenuState = {
  [GAMEMENU.PROFILE]    : { name: '' },
  [GAMEMENU.PLAYERS]    : { players: [] },
  [GAMEMENU.HISTORY]    : { matches: [] },
  [GAMEMENU.VOTE]       : { maps: [] },
  [GAMEMENU.TOP]        : { players: [] },
  [GAMEMENU.CREDITS]    : { gamemode: '', version: '' },
}

/**
 * Context of reducer state
 */
export const GameMenuContext = React.createContext<{
  state: typeof initialState
  dispatch: (action: GameMenuAction) => void
}>({
  state: initialState,
  dispatch: () => {}
})

/**
 * Reducer of GameMenu
 * @param {GameMenuState} state 
 * @param {GameMenuAction} action 
 */
export const reducer = (state: GameMenuState = initialState, action: GameMenuAction) => {
  const payload = { [action.type]: action.payload }

  return { ...state, ...payload}
}