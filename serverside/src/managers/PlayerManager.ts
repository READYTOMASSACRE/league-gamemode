import { event, eventable, commandable, command } from "rage-decorators"
import { singleton, autoInjectable } from "tsyringe"
import { app } from "../bootstrap"
import { EntityBase } from "../entities/EntityBase"
import { PlayerDto } from "../entities/dto/PlayerDto"
import { DummyPlayerRoundStatManager } from "./dummies/DummyPlayerRoundStatManager"
import { PlayerStatManager } from "./PlayerStatManager"
import { ErrorHandler } from "../core/ErrorHandler"

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
    readonly dummyStat: DummyPlayerRoundStatManager,
    readonly playerStatManager: PlayerStatManager,
    readonly errHandler: ErrorHandler,
  ) {
    super()

    this.playerReady    = this.playerReady.bind(this)
    this.playerDeath    = this.playerDeath.bind(this)
    this.spawnInLobby   = this.spawnInLobby.bind(this)
    this.setSharedData  = this.setSharedData.bind(this)
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
  
      this.playerStatManager.playerLogin(player)
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
  
      player.sharedData[key] = value
  
      if (key === 'teamId') {
        this.dummyStat.update({ id: player.id, [key]: value })
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * @todo rewrite the DTO Validator class
   * 
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
  
      const playerDto = new PlayerDto(player, dto)
  
      if (playerDto.isValid()) playerDto.save()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
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

    player.sharedData.state = SHARED.STATE.SELECT
    player.sharedData.teamId = SHARED.TEAMS.SPECTATORS
  }

  /**
   * @inheritdoc
   */
  toArray(): PlayerMp[] {
    return mp.players.toArray()
  }
}

export { PlayerManager }