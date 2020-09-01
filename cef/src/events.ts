import { register } from "rage-rpc"

export enum RPC {
  CLIENT_DEATHLOG                   = 'client.deathlog',
  CLIENT_WEAPON_REQUEST             = 'CEF.weaponDialog.request',
  CLIENT_CONSOLE                    = 'CEF.console',
  CLIENT_LANGUAGE                   = 'CEF.language',

  CEF_GAMEMENU_PROFILE              = 'CEF.gamemenu.profile',
  CEF_GAMEMENU_PLAYERS              = 'CEF.gamemenu.players',
  CEF_GAMEMENU_HISTORY              = 'CEF.gamemenu.history',
  CEF_GAMEMENU_VOTE                 = 'CEF.gamemenu.vote',
  CEF_GAMEMENU_VOTE_NOMINATE        = 'CEF.gamemenu.vote.nominate',
  CEF_GAMEMENU_TOP                  = 'CEF.gamemenu.top',
  CEF_GAMEMENU_CREDITS              = 'CEF.gamemenu.credits',
}

export enum RPC_DIALOG {
  CLIENT_DIALOG_OPEN                = 'CEF.dialog.open',
  CLIENT_DIALOG_CLOSE               = 'CEF.dialog.close',
  CLIENT_WEAPON_DIALOG_OPEN         = 'CEF.weaponDialog.open',
  CLIENT_WEAPON_DIALOG_CLOSE        = 'CEF.weaponDialog.close',
  CLIENT_SCOREBOARD_TOGGLE          = 'CEF.scoreboard.toggle',
  CLIENT_SCOREBOARD_DATA            = 'CEF.scoreboard.data',
  CLIENT_INFOPANEL_TOGGLE           = 'CEF.infopanel.toggle',
  CLIENT_INFOPANEL_DATA             = 'CEF.infopanel.data',
  CLIENT_NOTIFY_NOTISTACK           = 'CEF.notify.notistack',
  CLIENT_GAMEMENU_TOGGLE            = 'CEF.gamemenu.toggle',
  CLIENT_NOTIFY_ROUND_END           = 'CEF.notify.round.end',
  CLIENT_NOTIFY_DEATH               = 'CEF.notify.death',
  CLIENT_SPECTATE_CURRENT           = 'CEF.spectate.current',
  CLIENT_SPECTATE_CURRENT_TOGGLE    = 'CEF.spectate.current.toggle',
  CLIENT_SPECTATE_VIEWERS           = 'CEF.spectate.viewers',
  CLIENT_SPECTATE_VIEWERS_TOGGLE    = 'CEF.spectate.viewers.toggle',
  CLIENT_CONTROLS_TOGGLE            = 'CEF.controls.toggle',
  CLIENT_MAP_EDITOR_TOGGLE          = 'CEF.mapeditor.toggle',
  CLIENT_MAP_EDITOR_UPDATE          = 'CEF.mapeditor.update',

  CEF_MAP_EDITOR_ADD_POINT          = 'CEF.mapeditor.add.point',
  CEF_MAP_EDITOR_REMOVE_POINT       = 'CEF.mapeditor.remove.point',
  CEF_MAP_EDITOR_ADD_SPAWN_POINT    = 'CEF.mapeditor.add.spawnpoint',
  CEF_MAP_EDITOR_REMOVE_SPAWN_POINT = 'CEF.mapeditor.remove.spawnpoint',
  CEF_MAP_EDITOR_START              = 'CEF.mapeditor.start',
  CEF_MAP_EDITOR_STOP               = 'CEF.mapeditor.stop',
  CEF_MAP_EDITOR_RESET              = 'CEF.mapeditor.reset',
  CEF_MAP_EDITOR_SAVE               = 'CEF.mapeditor.save',
  CEF_MAP_EDITOR_UPDATE_CLIENT      = 'CEF.mapeditor.client.update',
}

export const registerGlobalEvents = () => {
  register(RPC.CLIENT_CONSOLE, (args: any) => console.log(args))
}