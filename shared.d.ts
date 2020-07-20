declare namespace SHARED {
  const enum EVENTS {
    /**
     * ================ SERVER-SIDE EVENTS ================
     */
    /** This event is invoked by serverside to draw a zone on minimap on clientside */
    SERVER_MAP_DRAW             = 'map.draw',
    /** This event is invoked by serverside to stop drawing a zone on minimap on clientside */
    SERVER_MAP_CLEAR            = 'map.clear',
    /** This event is invoked by serverside when round starts */
    SERVER_ROUND_START          = 'round.start',
    /** This event is invoked by serverside when round ends */
    SERVER_ROUND_END            = 'round.end',
    /** This event is invoked by serverside when the player is ready to play */
    SERVER_PLAYER_READY         = 'player.ready',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN         = 'player.login',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN_SUCCESS = 'player.login.success',
    /** This event is invoked by serverside when the player should logIn */
    SERVER_PLAYER_LOGIN_FAILURE = 'player.login.failure',
    /** This event is invoked by serverside to notify player errors */
    SERVER_NOTIFY_ERROR         = 'player.notify.error',
    /** This event is invoked by serverside to notify player that vote has started */
    SERVER_VOTEMAP_START        = 'votemap.start',
    
    /**
     * ================ CLIENT-SIDE EVENTS ================
     */
    /** This event is invoked by clientside to change shared data on server */
    CLIENT_SET_SHARED_DATA      = 'sharedData.set',
    /** This event is invoked by clientside to change player data on server */
    CLIENT_SET_PLAYER_DATA      = 'playerData.set',
    /** This event is invoked by clientside when the all dummies are registred */
    CLIENT_DUMMIES_READY        = 'dummies.ready',
    /** This event is invoked by clientside to spawn in lobby */
    CLIENT_SPAWN_IN_LOBBY       = 'spawn.lobby',
    /** This event is invoked by clientside to update round stat*/
    CLIENT_ROUND_STAT_UPDATE    = 'roundstat.update',
    /** This event is invoked by clientside to update round stat assist */
    CLIENT_ASSIST_UPDATE        = 'roundstat.update.assist',
    /** This event is invoked by clientside when client browser is ready */
    CLIENT_BROWSER_READY        = 'browser.ready',
    
    /**
    * ================= SHARED EVENTS =================
    */
    
     
    /**
    * ================= CEF EVENTS =================
    */
  }
    
  const enum RPC {
    /** This event is invoked by clientside to give player weapons */
    CLIENT_WEAPON_REQUEST             = 'CEF.weaponDialog.request',
    /** This event is invoked by clientside to pass params into CEF console.log */
    CLIENT_CONSOLE                    = 'CEF.console',
    /** This event is invoked by clientside to set up the new language */
    CLIENT_LANGUAGE                   = 'CEF.language',
    /** This event is invoked by clientside to set up new scoreboard data */
    CLIENT_SCOREBOARD_DATA            = 'CEF.scoreboard.data',
    /** This event is invoked by clientside to getting ping players */
    CLIENT_PING_REQUEST               = 'ping.request',
  }

  const enum RPC_DIALOG {
    /** This event invokes when the dialog is opened */
    CLIENT_DIALOG_OPEN                = 'CEF.dialog.open',
    /** This event invokes when the dialog is closed */
    CLIENT_DIALOG_CLOSE               = 'CEF.dialog.close',
    /** This event is invoked by clientside when the client should render a weapon dialog */
    CLIENT_WEAPON_DIALOG_OPEN         = 'CEF.weaponDialog.open',
    /** This event is invoked by clientside when the client should stop render a weapon dialog */
    CLIENT_WEAPON_DIALOG_CLOSE        = 'CEF.weaponDialog.close',
    /** This event is invoked by clientside when the client should render a scoreboard dialog */
    CLIENT_SCOREBOARD_OPEN            = 'CEF.scoreboard.open',
    /** This event is invoked by clientside when the client should stop render a scoreboard dialog */
    CLIENT_SCOREBOARD_CLOSE           = 'CEF.scoreboard.close',
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
    ROUND_STAT    = 3
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

    type Config = {
      SERVER_NAME               : string
      LOBBY                     : [number, number, number]
      TEAMS                     : Teams
      WEAPON_SET                : string[][]
      TEAM_SELECTOR             : TeamSelectorConfig
      LANGUAGE                  : string
      ROUND_TIME_INTERVAL       : number
      VOTE                      : {
        MAX_NOMITE: number
        TIME: number
      }
    }

    type DummyTypes = {
      [ENTITIES.CONFIG]         : Config
      [ENTITIES.MAP]            : GameMap
      [ENTITIES.PLAYER_STAT]    : PlayerRoundStatDTO
      [ENTITIES.ROUND_STAT]     : RoundStatDummyDTO
    }

    type SharedData = {
      state                     : SHARED.STATE
      teamId                    : SHARED.TEAMS
      stat?                     : PlayerStatDTO
    }

    type PlayerRoundStatDTO = {
      id                        : number
      rgscId                    : string
      win                       : boolean
      draw                      : boolean
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
      teamId                    : TEAMS
    }
  
    type RoundStatDTO = {
      timestamp                 : number
      players                   : PlayerRoundStatDTO[]
    }

    type RoundStatDummyDTO = {
      [key in Exclude<SHARED.TEAMS, SHARED.TEAMS.SPECTATORS>]: {
        score: number
      }
    }
  
    type PlayerStatDTO = {
      rgscId                    : string
      name                      : string
      registered                : number
      previousNames             : string[]
      timePlayed                : number
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
  }

  const enum MSG {
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
}