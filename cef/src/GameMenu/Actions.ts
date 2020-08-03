import { Dispatch } from 'react'
import { GAMEMENU, GameMenuAction } from "./Reducer"
import { callServer, callClient } from "rage-rpc"
import { RPC } from "../events"

export type Action    = object | Function
export type Actions   = { [key in GAMEMENU]: Action }

/**
 * Async dispatch handler
 * @param {GAMEMENU} type 
 * @param {Dispatch<GameMenuAction>} dispatch 
 * @param {Promise<any> | any} payload 
 */
const asyncDispatch   = async (type: GAMEMENU, dispatch: Dispatch<GameMenuAction>, payload: Promise<any> | any) => {
  if (payload instanceof Promise) payload = await Promise.resolve(payload)

  return dispatch({ type, payload })
}

/* register requests as action to dispatch a state */
export const profileRequest  = (dispatch: Dispatch<GameMenuAction>, id?: number) =>  asyncDispatch(GAMEMENU.PROFILE, dispatch, callServer(RPC.CEF_GAMEMENU_PROFILE, id))
export const playersRequest  = (dispatch: Dispatch<GameMenuAction>) => asyncDispatch(GAMEMENU.PLAYERS, dispatch, callServer(RPC.CEF_GAMEMENU_PLAYERS))
export const historyRequest  = (dispatch: Dispatch<GameMenuAction>) => asyncDispatch(GAMEMENU.HISTORY, dispatch, callServer(RPC.CEF_GAMEMENU_HISTORY))
export const voteRequest     = (dispatch: Dispatch<GameMenuAction>) => asyncDispatch(GAMEMENU.VOTE, dispatch, callClient(RPC.CEF_GAMEMENU_VOTE))
export const topRequest      = (dispatch: Dispatch<GameMenuAction>) => asyncDispatch(GAMEMENU.TOP, dispatch, callServer(RPC.CEF_GAMEMENU_TOP))
export const creditsRequest  = (dispatch: Dispatch<GameMenuAction>) => asyncDispatch(GAMEMENU.CREDITS, dispatch, callClient(RPC.CEF_GAMEMENU_CREDITS))

/* list of refreshing actions (update per click on refresh button) */
export const refreshActions: Partial<Actions> = {
  [GAMEMENU.HISTORY]    : historyRequest,
  [GAMEMENU.TOP]        : topRequest,
}

/* list of change actions (update per change a tab in tab panel) */
export const changeActions: Partial<Actions> = {
  [GAMEMENU.PROFILE]    : profileRequest,
  [GAMEMENU.PLAYERS]    : playersRequest,
  [GAMEMENU.VOTE]       : voteRequest,
}