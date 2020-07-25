import { register } from "rage-rpc"

export enum RPC {
  CLIENT_WEAPON_REQUEST       = 'CEF.weaponDialog.request',
  CLIENT_CONSOLE              = 'CEF.console',
  CLIENT_LANGUAGE             = 'CEF.language',
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
}

export const registerGlobalEvents = () => {
  register(RPC.CLIENT_CONSOLE, (args: any) => console.log(args))
}