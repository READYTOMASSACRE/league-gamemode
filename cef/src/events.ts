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
  CLIENT_SCOREBOARD_OPEN      = 'CEF.scoreboard.open',
  CLIENT_SCOREBOARD_CLOSE     = 'CEF.scoreboard.close',
  CLIENT_SCOREBOARD_DATA      = 'CEF.scoreboard.data',
}

export const registerGlobalEvents = () => {
  register(RPC.CLIENT_CONSOLE, (args: any) => console.log(args))
}