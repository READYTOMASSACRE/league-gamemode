declare namespace SHARED {
  const enum EVENTS {
    /**
     * ================ SERVER-SIDE EVENTS ================
     */
    /** This event is invoked by serverside to draw a zone on minimap on clientside */
    SERVER_MAP_DRAW               = 'map.draw',
    /** This event is invoked by serverside to stop drawing a zone on minimap on clientside */
    SERVER_MAP_CLEAR              = 'map.clear',
    /** This event is invoked by serverside when round starts */
    SERVER_ROUND_START            = 'round.start',
    /** This event is invoked by serverside when round ends */
    SERVER_ROUND_END              = 'round.end',
    /** This event is invoked by serverside when round is paused or unpaused */
    SERVER_ROUND_PAUSE            = 'round.pause',
    /** This event is invoked by serverside when the player is ready to play */
    SERVER_PLAYER_READY           = 'player.ready',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN           = 'player.login',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN_SUCCESS   = 'player.login.success',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN_FAILURE   = 'player.login.failure',
    /** This event is invoked by serverside to notify player */
    SERVER_NOTIFY                 = 'player.notify',
    /** This event is invoked by serverside to notify player */
    SERVER_NOTIFY_CHAT            = 'player.notify.chat',
    /** This event is invoked by serverside to notify player errors */
    SERVER_NOTIFY_ERROR           = 'player.notify.error',
    /** This event is invoked by serverside to notify player that vote has started */
    SERVER_VOTEMAP_START          = 'votemap.start',
    /** This event is invoked by serverside to update state of nominated maps */
    SERVER_VOTEMAP_UPDATE         = 'votemap.update',
    /** This event is invoked by serverside to add a new deathlog */
    SERVER_DEATHLOG               = 'server.deathlog',
    /**
     * ================ CLIENT-SIDE EVENTS ================
     */
    /** This event is invoked by clientside to change shared data on server */
    CLIENT_SET_SHARED_DATA        = 'sharedData.set',
    /** This event is invoked by clientside to change player data on server */
    CLIENT_SET_PLAYER_DATA        = 'playerData.set',
    /** This event is invoked by clientside when the all dummies are registred */
    CLIENT_DUMMIES_READY          = 'dummies.ready',
    /** This event is invoked by clientside to spawn in lobby */
    CLIENT_SPAWN_IN_LOBBY         = 'spawn.lobby',
    /** This event is invoked by clientside to update round stat*/
    CLIENT_ROUND_STAT_UPDATE      = 'roundstat.update',
    /** This event is invoked by clientside to update round stat assist */
    CLIENT_ASSIST_UPDATE          = 'roundstat.update.assist',
    /** This event is invoked by clientside when client browser is ready */
    CLIENT_BROWSER_READY          = 'browser.ready',
    /**
    * ================= SHARED EVENTS =================
    */
    
     
    /**
    * ================= CEF EVENTS =================
    */
  }
    
  const enum RPC {
    /** This event is invoked by clientside to give player weapons */
    CLIENT_WEAPON_REQUEST         = 'CEF.weaponDialog.request',
    /** This event is invoked by clientside to pass params into CEF console.log */
    CLIENT_CONSOLE                = 'CEF.console',
    /** This event is invoked by clientside to set up the new language */
    CLIENT_LANGUAGE               = 'CEF.language',
    /** This event is invoked by clientside to set up new scoreboard data */
    CLIENT_SCOREBOARD_DATA        = 'CEF.scoreboard.data',
    /** This event is invoked by clientside to getting ping players */
    CLIENT_PING_REQUEST           = 'ping.request',
    /** This event is invoked by clientside to set up new infopanel data */
    CLIENT_INFOPANEL_DATA         = 'CEF.infopanel.data',
    /** This event is invoked by clientside to CEF to add a new deathlog */
    CLIENT_DEATHLOG               = 'client.deathlog',

    /** This event is invoked by cef to request a player's profile */
    CEF_GAMEMENU_PROFILE          = 'CEF.gamemenu.profile',
    /** This event is invoked by cef to request players */
    CEF_GAMEMENU_PLAYERS          = 'CEF.gamemenu.players',
    /** This event is invoked by cef to request a players history */
    CEF_GAMEMENU_HISTORY          = 'CEF.gamemenu.history',
    /** This event is invoked by cef to request maps */
    CEF_GAMEMENU_VOTE             = 'CEF.gamemenu.vote',
    /** This event is invoked by cef to nominate a map */
    CEF_GAMEMENU_VOTE_NOMINATE    = 'CEF.gamemenu.vote.nominate',
    /** This event is invoked by cef to request a top of players */
    CEF_GAMEMENU_TOP              = 'CEF.gamemenu.top',
    /** This event is invoked by cef to request credits info */
    CEF_GAMEMENU_CREDITS          = 'CEF.gamemenu.credits',
  }

  /** @todo change CLIENT to CEF for cef call rpcs */
  const enum RPC_DIALOG {
    /** This event invokes when the dialog is opened */
    CLIENT_DIALOG_OPEN            = 'CEF.dialog.open',
    /** This event invokes when the dialog is closed */
    CLIENT_DIALOG_CLOSE           = 'CEF.dialog.close',
    /** This event is invoked by clientside when the client should render a weapon dialog */
    CLIENT_WEAPON_DIALOG_OPEN     = 'CEF.weaponDialog.open',
    /** This event is invoked by clientside when the client should stop render a weapon dialog */
    CLIENT_WEAPON_DIALOG_CLOSE    = 'CEF.weaponDialog.close',
    /** This event is invoked by clientside when the client should or should stop render a scoreboard dialog */
    CLIENT_SCOREBOARD_TOGGLE      = 'CEF.scoreboard.toggle',
    /** This event is invoked by clientside when the client should or should stop render a top info panel */
    CLIENT_INFOPANEL_TOGGLE       = 'CEF.infopanel.toggle',
    /** This event is invoked by clientside to send a mesage into cef */
    CLIENT_NOTIFY_NOTISTACK       = 'CEF.notify.notistack',
    /** This event is invoked by clientside when the client is toggling gamemenu */
    CLIENT_GAMEMENU_TOGGLE        = 'CEF.gamemenu.toggle',
  }

  
  /**
   * The player's states of the game
   */
  const enum STATE {
   /**
    * State when a player in the lobby in ready to play
    */
   IDLE,
   /**
    * State when a player in the round
    */
   ALIVE,
   /**
    * State when a player is dead and now can spectate for the players
    */
   DEAD,
   /**
    * State when a player in the team selecting
    */
   SELECT,
  }
  
  /**
   * Players teams
   */
  const enum TEAMS {
    ATTACKERS   = "ATTACKERS",
    DEFENDERS   = "DEFENDERS",
    SPECTATORS  = "SPECTATORS",
  }

  /**
   * Shared entities
   */
  const enum ENTITIES {
    CONFIG        = 0,
    MAP           = 1,
    PLAYER_STAT   = 2,
    ROUND_STAT    = 3,
    LANGUAGE      = 4
  }

  /**
   * User groups
   */
  const enum GROUP {
    USER        = 0,
    MODERATOR   = 1,
    ADMIN       = 2,
    ROOT        = 3,
  }

  namespace TYPES {
    type GameMap = {
      id                        : number
      code                      : string
      area                      : [number, number][]
      spawnPoints               : { [key in SHARED.TEAMS]: [number, number, number][] }
    }

    type Teams = {
      [key in SHARED.TEAMS]: {
        NAME                    : string
        SKINS                   : string[]
        COLOR                   : string
      }
    }

    type TeamSelectorConfig = {
      CAM: {
        VECTOR                  : [number, number, number]
        ROTATION                : [number, number, number]
        FOV                     : number
        DIMENSION               : number
        POINT_AT                : [number, number, number]
      }
      PED: {
        VECTOR                  : [number, number, number]
        HEADING                 : number
      }
    }

    type TextDrawParams = {
      FONT                    : number
      CENTRE                  : boolean
      // @ts-ignore
      SCALE                   : Array2d
      OUTLINE                 : boolean
      // @ts-ignore
      COLOR?                  : RGBA
    }

    type NametagConfig = {
      NICKNAME: TextDrawParams
      HEALTH_BAR: {
        WIDTH                   : number
        HEIGHT                  : number
        BORDER                  : number
        GRADIENT: {
          // @ts-ignore
          FULL                  : RGB
          // @ts-ignore
          EMPTY                 : RGB
        }
      }
      MAX_DISTANCE              : number
    }

    type GlobalHudConfig = {
      TEXT: TextDrawParams
    }

    type HudConfig = {
      GLOBAL                    : GlobalHudConfig
      NAMETAG                   : NametagConfig
    }

    type Config = {
      SERVER_NAME               : string
      LOBBY                     : [number, number, number]
      TEAMS                     : Teams
      WEAPON_SET                : string[][]
      TEAM_SELECTOR             : TeamSelectorConfig
      LANGUAGE                  : string
      ROUND_TIME_INTERVAL       : number
      VOTE                      : {
        MAX_NOMITE              : number
        TIME                    : number
      }
      HUD                       : HudConfig
      GAMEMODE                  : string
      VERSION                   : string
    }

    type DummyTypes = {
      [ENTITIES.CONFIG]         : Config
      [ENTITIES.MAP]            : GameMap
      [ENTITIES.PLAYER_STAT]    : PlayerRoundStatDTO
      [ENTITIES.ROUND_STAT]     : RoundStatDummyDTO
      [ENTITIES.LANGUAGE]       : { [key: string]: any }
    }

    type SharedData = {
      state                     : SHARED.STATE
      teamId                    : SHARED.TEAMS
      profile?                  : PlayerProfileDTO
      lang                      : string
      group                     : SHARED.GROUP
    }

    type PlayerRoundStatDTO = {
      id                        : number
      rgscId                    : string
      kill                      : number
      death                     : number
      assist                    : number
      // @ts-ignore
      damage                    : Partial<{ [key in RageEnums.Hashes.Weapon]: number }>
      // @ts-ignore
      damageReceived            : Partial<{ [key in RageEnums.Hashes.Weapon]: number }>
      shotsFired                : number
      shotsHit                  : number
      accuracy                  : number
    }
  
    type RoundStatDTO = {
      created_at                : number
      winner                    : SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS | false
      [SHARED.TEAMS.ATTACKERS]  : PlayerRoundStatDTO[]
      [SHARED.TEAMS.DEFENDERS]  : PlayerRoundStatDTO[]
    }

    type RoundStatDummyDTO = {
      [key in Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>]: {
        score                   : number
      }
    }
  
    type PlayerProfileDTO = {
      rgscId                    : string
      name                      : string
      registered                : number
      previousNames             : string[]
      timePlayed                : number
      group                     : Exclude<GROUP, GROUP.ROOT>
      password                  : string
      matches                   : number
      wins                      : number
      draws                     : number
      losses                    : number
      kill                      : number
      death                     : number
      assist                    : number
      shotsFired                : number
      shotsHit                  : number
      accuracy                  : number
      mmr                       : number
      exp                       : number
      lvl                       : number
    }

    type Vector2 = {
      x                         : number
      y                         : number
      xy                        : [number, number]
    
      at(index                  : number): number
      reset()                   : void
      copy(dest?                : Vector2): Vector2
      negate(dest?              : Vector2): Vector2
      equals(vector             : Vector2, threshold?: number): boolean
      length()                  : number
      squaredLength()           : number
      add(vector                : Vector2): Vector2
      subtract(vector           : Vector2): Vector2
      multiply(vector           : Vector2): Vector2
      divide(vector             : Vector2): Vector2
      scale(value               : number, dest?: Vector2): Vector2
      normalize(dest?           : Vector2): Vector2
      toJSON()                  : [number, number]
    }

    type NotifyVariantType = 'default' | 'error' | 'success' | 'warning' | 'info'
  }

  const enum MSG {
    CMD_SAVE_POS                      = "CMD_SAVE_POS",
    CMD_VOTE                          = "CMD_VOTE",
    CMD_CHANGE_LANG                   = "CMD_CHANGE_LANG",
    CMD_ADD_TO_ROUND                  = "CMD_ADD_TO_ROUND",
    CMD_REMOVE_FROM_ROUND             = "CMD_REMOVE_FROM_ROUND",
    CMD_KICK                          = "CMD_KICK",
    CMD_MUTE                          = "CMD_MUTE",
    CMD_UNMUTE                        = "CMD_UNMUTE",
    CMD_CHANGE_TEAM                   = "CMD_CHANGE_TEAM",
    CMD_ROUND_START                   = "CMD_ROUND_START",
    CMD_ROUND_END                     = "CMD_ROUND_END",

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
    ERR_PLAYER_NOT_FOUND              = 'ERR_PLAYER_NOT_FOUND',
    ERR_WEAPON_NOT_FOUND              = "ERR_WEAPON_NOT_FOUND",
    ERR_LANG_NOT_FOUND                = "ERR_LANG_NOT_FOUND",
    ERR_TOO_MANY_MAPS                 = "ERR_TOO_MANY_MAPS",
    ERR_TOO_MANY_PLAYERS              = 'ERR_TOO_MANY_PLAYERS',
    ERR_WRONG_TYPE                    = "ERR_WRONG_TYPE",
    ERR_PROFILE_NOT_FOUND             = "ERR_PROFILE_NOT_FOUND",
    ERR_ROUND_PLAYER_NOT_FOUND        = "ERR_ROUND_PLAYER_NOT_FOUND",
  
    ERR_PLAYER_HAS_ALREADY_VOTED      = "ERR_PLAYER_HAS_ALREADY_VOTED",
  
    ERR_VOTEMAP_MAX_NOMINATED         = "ERR_VOTEMAP_MAX_NOMINATED",
    ERR_VOTEMAP_HAS_NOT_ADDED         = "ERR_VOTEMAP_HAS_NOT_ADDED",
  
    ERR_ROUND_IS_NOT_RUNNING          = "ERR_ROUND_IS_NOT_RUNNING",
    ERR_ROUND_IS_RUNNING              = "ERR_ROUND_IS_RUNNING",
    ERR_ROUND_IS_PAUSED               = "ERR_ROUND_IS_PAUSED",
    ERR_ROUND_IS_UNPAUSED             = "ERR_ROUND_IS_UNPAUSED",
    ERR_PLAYER_IN_ROUND               = "ERR_PLAYER_IN_ROUND",
    ERR_PLAYER_NOT_IN_ROUND           = "ERR_PLAYER_NOT_IN_ROUND",

    TEAM_SELECTOR_CHANGE              = "TEAM_SELECTOR_CHANGE",
    TEAM_SELECTOR_CHANGE_CANCEL       = "TEAM_SELECTOR_CHANGE_CANCEL",
    TEAM_SELECTOR_CHANGE_TEAM         = "TEAM_SELECTOR_CHANGE_TEAM",
    TEAM_SELECTOR_CHANGE_SKIN         = "TEAM_SELECTOR_CHANGE_SKIN",
    TEAM_SELECTOR_SUBMIT              = "TEAM_SELECTOR_SUBMIT",

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

    CONTROL                           = "CONTROL",
    CONTROL_SCOREBOARD                = "CONTROL_SCOREBOARD",
    CONTROL_GAMEMENU                  = "CONTROL_GAMEMENU",
    CONTROL_TEAMCHANGE                = "CONTROL_TEAMCHANGE",

    SCOREBOARD_PLAYERS                = "SCOREBOARD_PLAYERS",
    TIME_REMAINING                    = "TIME_REMAINING",
    VOTEMAP_NOTIFY                    = "VOTEMAP_NOTIFY",
    WEAPON_CHOOSE_TEXT                = "WEAPON_CHOOSE_TEXT",

    ROUND_START_MESSAGE               = "ROUND_START_MESSAGE",
    ROUND_STOP_MESSAGE                = "ROUND_STOP_MESSAGE",
    ROUND_PAUSED_MESSAGE              = "ROUND_PAUSED_MESSAGE",
    ROUND_ADD_TO_ROUND_SUCCESS        = "ROUND_ADD_TO_ROUND_SUCCESS",
    ROUND_REMOVE_FROM_ROUND_SUCCESS   = "ROUND_REMOVE_FROM_ROUND_SUCCESS",

    GROUP_LOGIN_SUCCESS               = "GROUP_LOGIN_SUCCESS",
    GROUP_LOGIN_FAILURE               = "GROUP_LOGIN_FAILURE",
    GROUP_LOGIN_INVALID               = "GROUP_LOGIN_INVALID",
    GROUP_LOGGED_ALREADY              = "GROUP_LOGGED_ALREADY",
    GROUP_ERR_WRONG_ACCESS            = "GROUP_ERR_WRONG_ACCESS",
    GROUP_ERR_SIMILAR_GROUP           = "GROUP_ERR_SIMILAR_GROUP",
    GROUP_ROOT                        = "GROUP_ROOT",
    GROUP_ADMIN                       = "GROUP_ADMIN",
    GROUP_MODERATOR                   = "GROUP_MODERATOR",
    GROUP_USER                        = "GROUP_USER",
    GROUP_ADD_SUCCESS                 = "GROUP_ADD_SUCCESS",
    GROUP_ADD_SUCCESS_SELF            = "GROUP_ADD_SUCCESS_SELF",
    GROUP_PASSWORD_CHANGED            = "GROUP_PASSWORD_CHANGED",

    PLAYER_KICKED                     = "PLAYER_KICKED",
    PLAYER_MUTED                      = "PLAYER_MUTED",
    PLAYER_UNMUTED                    = "PLAYER_UNMUTED",
    PLAYER_IS_MUTED                   = "PLAYER_IS_MUTED",
    PLAYER_CHANGED_TEAM               = "PLAYER_CHANGED_TEAM",
    PLAYER_JOINED                     = "PLAYER_JOINED",
    PLAYER_LEFT                       = "PLAYER_LEFT",
    REASON_NULL                       = "REASON_NULL",

    GAMEMENU_PROFILE                  = "GAMEMENU_PROFILE",
    GAMEMENU_PROFILE_TITLE            = "GAMEMENU_PROFILE_TITLE",

    GAMEMENU_PLAYERS                  = "GAMEMENU_PLAYERS",
    GAMEMENU_PLAYERS_TD_ID            = "GAMEMENU_PLAYERS_TD_ID",
    GAMEMENU_PLAYERS_TD_NAME          = "GAMEMENU_PLAYERS_TD_NAME",
    GAMEMENU_PLAYERS_TD_MMR           = "GAMEMENU_PLAYERS_TD_MMR",
    GAMEMENU_PLAYERS_TD_ACTIONS       = "GAMEMENU_PLAYERS_TD_ACTIONS",

    GAMEMENU_HISTORY                  = "GAMEMENU_HISTORY",
    GAMEMENU_HISTORY_TD_RESULT        = "GAMEMENU_HISTORY_TD_RESULT",
    GAMEMENU_HISTORY_TD_DATE          = "GAMEMENU_HISTORY_TD_DATE",
    GAMEMENU_HISTORY_TD_KDA           = "GAMEMENU_HISTORY_TD_KDA",

    GAMEMENU_VOTE                     = "GAMEMENU_VOTE",
    GAMEMENU_VOTE_LABEL               = "GAMEMENU_VOTE_LABEL",
    GAMEMENU_VOTE_PLACEHOLDER         = "GAMEMENU_VOTE_PLACEHOLDER",
    GAMEMENU_VOTE_NOMINATE            = "GAMEMENU_VOTE_NOMINATE",

    GAMEMENU_TOP                      = "GAMEMENU_TOP",
    GAMEMENU_CREDITS                  = "GAMEMENU_CREDITS",
  }
}