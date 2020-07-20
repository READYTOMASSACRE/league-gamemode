export enum MSG {
  CMD_DESC_SAVE_POS                 = "CMD_DESC_SAVE_POS",
  CMD_DESC_VOTE                     = "CMD_DESC_VOTE",
  CMD_DESC_CHANGE_LANG              = "CMD_DESC_CHANGE_LANG",

  PAGE_SHOW_CMD                     = "PAGE_SHOW_CMD",

  ERR_WRONG_PLAYER_ID               = "ERR_WRONG_PLAYER_ID",
  ERR_WRONG_PLAYER_DATA             = "ERR_WRONG_PLAYER_DATA",
  ERR_WRONG_SET_PLAYER_DATA         = "ERR_WRONG_SET_PLAYER_DATA",

  ERR_INVALID_KEY                   = "ERR_INVALID_KEY",
  ERR_INVALID_VALIDATOR             = "ERR_INVALID_VALIDATOR",
  ERR_INVALID_OPERATION             = "ERR_INVALID_OPERATION",
  ERR_INVALID_ROUND_STATE_UPDATE    = "ERR_INVALID_ROUND_STATE_UPDATE",
  ERR_INVALID_ROUND_STAT            = "ERR_INVALID_ROUND_STAT",
  ERR_INVALID_PLAYER_STATE          = "ERR_INVALID_PLAYER_STATE",
  ERR_INVALID_PLAYING_TIME          = "ERR_INVALID_PLAYING_TIME",

  ERR_NOT_FOUND                     = "ERR_NOT_FOUND",
  ERR_MAP_NOT_FOUND                 = "ERR_MAP_NOT_FOUND",
  ERR_WEAPON_NOT_FOUND              = "ERR_WEAPON_NOT_FOUND",
  ERR_LANG_NOT_FOUND                = "ERR_LANG_NOT_FOUND",
  ERR_TOO_MANY_MAPS                 = "ERR_TOO_MANY_MAPS",
  ERR_WRONG_TYPE                    = "ERR_WRONG_TYPE",

  ERR_PLAYER_HAS_ALREADY_VOTED      = "ERR_PLAYER_HAS_ALREADY_VOTED",

  ERR_VOTEMAP_MAX_NOMINATED         = "ERR_VOTEMAP_MAX_NOMINATED",
  ERR_VOTEMAP_HAS_NOT_ADDED         = "ERR_VOTEMAP_HAS_NOT_ADDED",

  ERR_ROUND_IS_NOT_RUNNING          = "ERR_ROUND_IS_NOT_RUNNING",
  ERR_ROUND_IS_RUNNING              = "ERR_ROUND_IS_RUNNING",
  TEAM_SELECTOR_CHANGE              = "TEAM_SELECTOR_CHANGE",
  TEAM_SELECTOR_CHANGE_CANCEL       = "TEAM_SELECTOR_CHANGE_CANCEL",

  KILL                              = "KILL",
  DEATH                             = "DEATH",
  ASSIST                            = "ASSIST",
  LVL                               = "LVL",
  DAMAGE                            = "DAMAGE",
  DAMAGE_RECEIVED                   = "DAMAGE_RECEIVED",
  PING                              = "PING",

  IDLE                              = "IDLE",
  SELECT                            = "SELECT",
  ALIVE                             = "ALIVE",
  DEAD                              = "DEAD",

  SCOREBOARD_PLAYERS                = "SCOREBOARD_PLAYERS",
  TIME_REMAINING                    = "TIME_REMAINING",
  VOTEMAP_NOTIFY                    = "VOTEMAP_NOTIFY",
  WEAPON_CHOOSE_TEXT                = "WEAPON_CHOOSE_TEXT",
}