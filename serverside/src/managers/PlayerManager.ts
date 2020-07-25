import { event, eventable } from "rage-decorators"
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
import { IsNotExistsError } from "../errors/LogErrors"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"

/**
 * Class to manage interactions with the players
 */
@singleton()
@eventable()
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

    this.playerReady    = this.playerReady.bind(this)
    this.playerDeath    = this.playerDeath.bind(this)
    this.spawnInLobby   = this.spawnInLobby.bind(this)
    this.setSharedData  = this.setSharedData.bind(this)
    this.playerChat     = this.playerChat.bind(this)
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
  playerDeath(player: PlayerMp): void {
    return this.spawnInLobby(player)
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

    player.sharedData.group   = SHARED.GROUP.USER
    player.sharedData.state   = SHARED.STATE.SELECT
    player.sharedData.teamId  = SHARED.TEAMS.SPECTATORS
    player.sharedData.lang    = this.config.get('LANGUAGE')
  }

  /**
   * Calls a client event to notify a player
   * @param {PlayerMp} player 
   * @param {string} message - a text message
   * @param {string} level - a level of notify
   */
  notify(player: PlayerMp, message: string, level: SHARED.TYPES.NotifyVariantType = 'info'): void {
    player.call(SHARED.EVENTS.SERVER_NOTIFY, [message, level])
  }

  /**
   * Notify all players
   * @param {string} message - a text message
   * @param {string} level - a level of notify
   */
  notifyAll(message: string, level: SHARED.TYPES.NotifyVariantType = 'info'): void {
    mp.players.forEach(player => this.notify(player, message, level))
  }

  /**
   * Notify all players by message id with player language
   * @param {string} message - a message id
   * @param {string} level - a level of notify
   */
  notifyLanguageChatAll(message: string, ...args: string[]): void {
    mp.players.forEach(player => {
      const lang = this.getLang(player)
      const msgText = this.lang.get(lang, message, ...args)

      player.outputChatBox(msgText)
    })
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
      if (notifiedPlayer) {
        const message = this.lang.get(notifiedPlayer.sharedData.lang, SHARED.MSG.ERR_PLAYER_NOT_FOUND, playerId)
        throw new NotFoundNotifyError(message, notifiedPlayer)
      } else {
        const message = this.lang.get('en', SHARED.MSG.ERR_PLAYER_NOT_FOUND, playerId)
        throw new IsNotExistsError(message)
      }
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
      if (notifiedPlayer) {
        const message = this.lang.get(this.getLang(notifiedPlayer), SHARED.MSG.ERR_PLAYER_NOT_FOUND, name)
        throw new InvalidArgumentNotify(message, notifiedPlayer)
      } else {
        const message = this.lang.get('en', SHARED.MSG.ERR_PLAYER_NOT_FOUND, name)
        throw new IsNotExistsError(message)
      }
    }

    if (players.length > 1) {
      const names = players.map(player => player.name)
      if (notifiedPlayer) {
        const message = this.lang.get(this.getLang(notifiedPlayer), SHARED.MSG.ERR_TOO_MANY_PLAYERS, names.join(', '))
        throw new InvalidArgumentNotify(message, notifiedPlayer)
      } else {
        const message = this.lang.get('en', SHARED.MSG.ERR_TOO_MANY_PLAYERS, names.join(', '))
        throw new IsNotExistsError(message)
      }
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

  /**
   * @inheritdoc
   */
  toArray(): PlayerMp[] {
    return mp.players.toArray()
  }
}

export { PlayerManager }