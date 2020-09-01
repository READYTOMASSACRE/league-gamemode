import { event, eventable, commandable, command } from "rage-decorators"
import { singleton, autoInjectable } from "tsyringe"
import { app } from "../bootstrap"
import { EntityBase } from "../entities/EntityBase"
import { PlayerDataValidator } from "../entities/validators/PlayerDataValidator"
import { DummyPlayerRoundStatManager } from "./dummies/DummyPlayerRoundStatManager"
import { PlayerProfileManager } from "./PlayerProfileManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { Config } from "../core/Config"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { getFormattedCurrentTime, keys, escapeRegExp, isNumber } from "../utils"
import { SharedDataValidator } from "../entities/validators/SharedDataValidator"
import { NotFoundNotifyError, InvalidArgumentNotify } from "../errors/PlayerErrors"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { weapons } from "../declarations/weapons"
import { InvalidArgument } from "../errors/LogErrors"

/**
 * Class to manage interactions with the players
 */
@singleton()
@eventable()
@commandable()
@autoInjectable()
class PlayerManager extends EntityBase<PlayerMp> {
  static readonly LOBBY = app.getConfig().get("LOBBY")

  constructor(
    readonly config: Config,
    readonly dummyStat: DummyPlayerRoundStatManager,
    readonly dummyConfig: DummyConfigManager,
    readonly playerProfileManager: PlayerProfileManager,
    readonly errHandler: ErrorHandler,
    readonly lang: DummyLanguageManager,
  ) {
    super()

    this.playerReady          = this.playerReady.bind(this)
    this.playerDeath          = this.playerDeath.bind(this)
    this.spawnInLobby         = this.spawnInLobby.bind(this)
    this.setSharedData        = this.setSharedData.bind(this)
    this.playerChat           = this.playerChat.bind(this)
    this.playerJoin           = this.playerJoin.bind(this)
    this.playerQuit           = this.playerQuit.bind(this)
    this.setPlayerData        = this.setPlayerData.bind(this)
  }

  /**
   * Event
   * 
   * Fires when the player is ready
   * and init all player connected functions
   * 
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_READY)
  playerReady(player: PlayerMp) {
    try {
      this.initData(player)
      player.playingTime = Date.now()
  
      this.playerProfileManager.playerLogin(player)
      this.dummyStat.playerReady(player)
  
      // notice player that server is ready
      player.call(SHARED.EVENTS.SERVER_PLAYER_READY, [])
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the player is dead
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_DEATH)
  playerDeath(player: PlayerMp, reason: number, killer?: PlayerMp): void {
    try {
      return this.spawnInLobby(player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Handle a player's death
   * @param {PlayerMp} player 
   * @param {number} reason 
   * @param {PlayerMp} killer (optional)
   */
  playerDeathNotify(player: PlayerMp, reason: number, killer?: PlayerMp): void {
    if (
      this.hasState(player, SHARED.STATE.ALIVE)
      && killer
      && mp.players.exists(killer)
      && this.hasState(killer, [SHARED.STATE.ALIVE])
    ) {
      const { COLOR: playerColor } = this.dummyConfig.getTeamData(player.sharedData.teamId)
      const { COLOR: killerColor } = this.dummyConfig.getTeamData(killer.sharedData.teamId)

      const playerData = { name: player.name, color: playerColor }
      const killerData = { name: killer.name, color: killerColor }
      mp.players.forEach(ppl => ppl.call(SHARED.EVENTS.SERVER_DEATHLOG, [playerData, weapons[reason] || "", killerData]))
    }
  }

  /**
   * Event
   * 
   * Fires when the client need to spawn in lobby
   * @param {PlayerMp} player 
   */
  @event(SHARED.EVENTS.CLIENT_SPAWN_IN_LOBBY)
  spawnInLobby(player: PlayerMp): void {
    try {
      const [x, y, z] = PlayerManager.LOBBY
  
      player.spawn(new mp.Vector3(x, y, z))
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the client need change shared data
   * @param {PlayerMp} player 
   * @param {K} key - the key of shared data
   * @param {any} value - the value of shared data
   */
  @event(SHARED.EVENTS.CLIENT_SET_SHARED_DATA)
  setSharedData<K extends keyof SHARED.TYPES.SharedData>(player: PlayerMp, key: K, value: any) {
    try {
      if (!player.sharedData) this.initData(player)
  
      const sharedDataValidator = new SharedDataValidator({ [key]: value })
      if (sharedDataValidator.isValid()) {
        player.sharedData[key] = value

        if (key === 'teamId') {
          this.dummyStat.update({ id: player.id, [key]: value })
        }
      }
  
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when the client need change player data, such as position and etc.
   * @param {PlayerMp} player 
   * @param {string} data - JSON string of the player data
   */
  @event(SHARED.EVENTS.CLIENT_SET_PLAYER_DATA)
  setPlayerData(player: PlayerMp, data: string) : void {
    try {
      const dto = JSON.parse(data)
  
      if (typeof dto !== 'object') return

      if (typeof dto.position === 'object') {
        dto.position = new mp.Vector3(dto.position.x, dto.position.y, dto.position.z)
      }

      const playerValidator = new PlayerDataValidator(dto)
  
      if (playerValidator.isValid()) {
        keys(playerValidator.validated)
          .forEach(key => {
            player[key] = playerValidator.validated[key] as any
          })
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when a player send a message in the chat
   * @param {PlayerMp} player 
   * @param {string} text
   */
  @event(RageEnums.EventKey.PLAYER_CHAT)
  playerChat(player: PlayerMp, text: string): void {
    try {
      if (this.isMuted(player)) {
        const lang = this.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.PLAYER_IS_MUTED, this.getMutedTimeMinutes(player))
        player.outputChatBox(message)
      } else {
        mp.players.forEach(ppl => ppl.outputChatBox(this.formatMessage(player, text)))
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when when a player has joined the server
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_JOIN)
  playerJoin(player: PlayerMp): void {
    try {
      mp.players.call(mp.players.toArray(), SHARED.EVENTS.SERVER_NOTIFY_CHAT, [SHARED.MSG.PLAYER_JOINED, player.name])
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when when a player has left from the server
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_QUIT)
  playerQuit(player: PlayerMp, exitType: "disconnect" | "timeout" | "kicked", reason: string): void {
    try {
      console.debug('Player exit', exitType, reason)
      mp.players.call(mp.players.toArray(), SHARED.EVENTS.SERVER_NOTIFY_CHAT, [SHARED.MSG.PLAYER_LEFT, player.name, exitType])
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when a player has taken a damage
   * Send a notify to clientside by id
   * @param {PlayerMp} player 
   * @param {number} id - target player, who has shot
   * @param {string} damageParams - json data
   */
  @event(SHARED.EVENTS.CLIENT_DAMAGE_REQUEST_NOTIFY)
  damageRequestNotify(player: PlayerMp, id: number, damageParams: string): void {
    try {
      const player = mp.players.at(id)

      if (mp.players.exists(player)) {
        const { weapon, damage, distance } = JSON.parse(damageParams)
        if (
          typeof weapon === 'number'
          && typeof damage === 'number'
          && (
            typeof distance === 'number'
            || typeof distance === 'undefined'
          )
        ) {
          player.call(SHARED.EVENTS.SERVER_DAMAGE_NOTIFY, [damageParams])
        } else {
          throw new InvalidArgument("Invalid data from clientside")
        }
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
  /**
   * Format a message from the player
   * @param player 
   * @param text 
   */
  private formatMessage(player: PlayerMp, text: string): string {
    const teamId          = this.getTeam(player)
    const { COLOR }       = this.dummyConfig.getTeamData(teamId)

    return `[${getFormattedCurrentTime()}] !{${COLOR}}${player.name}[${player.id}]: !{white}${text}`
  }

  /**
   * Spawn the player
   * 
   * @param {PlayerMp} player 
   * @param {Vector3Mp} spawnVector 
   */
  spawn(player: PlayerMp, spawnVector: Vector3Mp): boolean {
    player.spawn(spawnVector)

    return true
  }

  /**
   * @inheritdoc
   */
  initData(player: PlayerMp): void {
    super.initData(player)

    player.sharedData.group       = SHARED.GROUP.USER
    player.sharedData.state       = SHARED.STATE.SELECT
    player.sharedData.teamId      = SHARED.TEAMS.SPECTATORS
    player.sharedData.lang        = this.config.get('LANGUAGE')
    player.sharedData.spectate    = -1
  }

  /**
   * Calls a client event to notify a player
   * @param {PlayerMp} player 
   * @param {string} message - a text message
   * @param {string} level - a level of notify
   */
  notify(player: PlayerMp, message: string, level: SHARED.TYPES.NotifyVariantType = 'info', ...args: string[]): void {
    player.call(SHARED.EVENTS.SERVER_NOTIFY, [message, level, ...args])
  }

  /**
   * Calls a client event to notify about info to the player
   * @param {PlayerMp} player 
   * @param {string} message - a text message or message id
   * @param {string[]} args - other args for message id
   */
  info(player: PlayerMp, message: string, ...args: string[]): void {
    return this.notify(player, message, 'info', ...args)
  }

  /**
   * Calls a client event to notify about error to the player
   * @param {PlayerMp} player 
   * @param {string} message - a text message or message id
   * @param {string[]} args - other args for message id
   */
  error(player: PlayerMp, message: string, ...args: string[]): void {
    return this.notify(player, message, 'error', ...args)
  }

  /**
   * Calls a client event to notify about success to the player
   * @param {PlayerMp} player 
   * @param {string} message - a text message or message id
   * @param {string[]} args - other args for message id
   */
  success(player: PlayerMp, message: string, ...args: string[]): void {
    return this.notify(player, message, 'success', ...args)
  }

  /**
   * Calls a client event to notify about warning to the player
   * @param {PlayerMp} player 
   * @param {string} message - a text message or message id
   * @param {string[]} args - other args for message id
   */
  warning(player: PlayerMp, message: string, ...args: string[]): void {
    return this.notify(player, message, 'warning', ...args)
  }

  /**
   * Calls a client event to notify about default to the player
   * @param {PlayerMp} player 
   * @param {string} message - a text message or message id
   * @param {string[]} args - other args for message id
   */
  default(player: PlayerMp, message: string, ...args: string[]): void {
    return this.notify(player, message, 'default', ...args)
  }

  /**
   * Notify all players
   * @param {string} message - a text message
   * @param {string} level - a level of notify
   */
  notifyAll(message: string, level: SHARED.TYPES.NotifyVariantType = 'info', ...args: string[]): void {
    mp.players.forEach(player => this.notify(player, message, level, ...args))
  }

  /**
   * Get a player's lang
   * @param {PlayerMp} player 
   */
  getLang(player: PlayerMp): string {
    return player.sharedData.lang
  }

  /**
   * Set a player's group
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - a new group
   */
  setGroup(player: PlayerMp, group: SHARED.GROUP): boolean {
    player.sharedData.group = group

    return true
  }

  /**
   * Get a player's group
   * @param {PlayerMp} player
   */
  getGroup(player: PlayerMp): SHARED.GROUP {
    return player.sharedData.group
  }

  /**
   * Get a player by id or name
   * @param {string} idOrCode 
   * @param {PlayerMp} notifiedPlayer - optional
   */
  getPlayerByIdOrName(idOrCode: string, notifiedPlayer?: PlayerMp): PlayerMp {
    if (isNumber(idOrCode)) {
      return this.getPlayerById(+idOrCode, notifiedPlayer)
    } else {
      return this.getPlayerByName(idOrCode, notifiedPlayer)
    }
  }

  /**
   * Get a player by id with notify
   * @param {number} playerId 
   * @param {PlayerMp} notifiedPlayer (optional) - notify player if it is necessary
   */
  getPlayerById(playerId: number, notifiedPlayer?: PlayerMp): PlayerMp {
    const player = mp.players.at(playerId)

    // check if player exists
    if (!player || !mp.players.exists(player)) {
      throw new NotFoundNotifyError(SHARED.MSG.ERR_PLAYER_NOT_FOUND, notifiedPlayer, playerId.toString())
    }

    return player
  }


  /**
   * Get a player by name with notify
   * @param {number} playerId 
   * @param {PlayerMp} notifiedPlayer (optional) - notify player if it is necessary
   */
  getPlayerByName(name: string, notifiedPlayer?: PlayerMp): PlayerMp {
    const regex = new RegExp(escapeRegExp(name), 'gi')
    const players = mp.players
      .toArray()
      .filter(player => player.name.match(regex))

    if (!players.length) {
      throw new InvalidArgumentNotify(SHARED.MSG.ERR_PLAYER_NOT_FOUND, notifiedPlayer, name)
    }

    if (players.length > 1) {
      const names = players.map(player => player.name)
      throw new InvalidArgumentNotify(SHARED.MSG.ERR_TOO_MANY_PLAYERS, notifiedPlayer, names.join(', '))
    }

    const [ player ] = players

    return player
  }

  /**
   * Mute player
   * @param {PlayerMp} player 
   * @param {number} minutes 
   */
  mute(player: PlayerMp, minutes: number): boolean {
    const expired = Date.now() + minutes * 60 * 1000
    player.muted = expired

    return true
  }

  /**
   * Unmute player
   * @param {PlayerMp} player 
   */
  unmute(player: PlayerMp): boolean {
    player.muted = 0
    return true
  }

  /**
   * Is player muted
   * @param {PlayerMp} player 
   * @param {number} minutes 
   */
  isMuted(player: PlayerMp): boolean {
    return player.muted > Date.now()
  }

  /**
   * Get muted time left in minutes
   * @param {PLayerMp} player 
   */
  getMutedTimeMinutes(player: PlayerMp): number {
    if (!this.isMuted(player)) return 0

    const ms = player.muted - Date.now()

    return Math.round(ms / (60 * 1000))
  }

  setPlayerTeam(player: PlayerMp, teamId: SHARED.TEAMS): void {
    this.setTeam(player, teamId)
    const skin = this.dummyConfig.getRandomSkin(teamId)

    player.model = mp.joaat(skin)
    this.spawnInLobby(player)
  }

  /**
   * @inheritdoc
   */
  toArray(): PlayerMp[] {
    return mp.players.toArray()
  }
}

export { PlayerManager }