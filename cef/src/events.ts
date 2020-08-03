import { register } from "rage-rpc"

export enum RPC {
  CLIENT_DEATHLOG             = 'client.deathlog',
  CLIENT_WEAPON_REQUEST       = 'CEF.weaponDialog.request',
  CLIENT_CONSOLE              = 'CEF.console',
  CLIENT_LANGUAGE             = 'CEF.language',

  CEF_GAMEMENU_PROFILE        = 'CEF.gamemenu.profile',
  CEF_GAMEMENU_PLAYERS        = 'CEF.gamemenu.players',
  CEF_GAMEMENU_HISTORY        = 'CEF.gamemenu.history',
  CEF_GAMEMENU_VOTE           = 'CEF.gamemenu.vote',
  CEF_GAMEMENU_VOTE_NOMINATE  = 'CEF.gamemenu.vote.nominate',
  CEF_GAMEMENU_TOP            = 'CEF.gamemenu.top',
  CEF_GAMEMENU_CREDITS        = 'CEF.gamemenu.credits',
}

export enum RPC_DIALOG {
  CLIENT_DIALOG_OPEN          = 'CEF.dialog.open',
  CLIENT_DIALOG_CLOSE         = 'CEF.dialog.close',
  CLIENT_WEAPON_DIALOG_OPEN   = 'CEF.weaponDialog.open',
  CLIENT_WEAPON_DIALOG_CLOSE  = 'CEF.weaponDialog.close',
  CLIENT_SCOREBOARD_TOGGLE    = 'CEF.scoreboard.toggle',
  CLIENT_SCOREBOARD_DATA      = 'CEF.scoreboard.data',
  CLIENT_INFOPANEL_TOGGLE     = 'CEF.infopanel.toggle',
  CLIENT_INFOPANEL_DATA       = 'CEF.infopanel.data',
  CLIENT_NOTIFY_NOTISTACK     = 'CEF.notify.notistack',
  CLIENT_GAMEMENU_TOGGLE      = 'CEF.gamemenu.toggle',
}

export const registerGlobalEvents = () => {
  register(RPC.CLIENT_CONSOLE, (args: any) => console.log(args))
}