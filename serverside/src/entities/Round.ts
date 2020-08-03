import { DEBUG } from '../bootstrap'
import { logMethod } from '../utils'
import { DummyMapManager } from '../managers/dummies/DummyMapManager'
import { PlayerManager } from '../managers/PlayerManager'

/**
 * Interface of the round constructor params
 */
interface RoundParams {
  roundTimeInterval: number
  lobby: Vector3Mp
  mapId: number
  weaponSet: string[][]
  dimension: { lobby: number, round: number }
  dummyMapManager: DummyMapManager
  players: PlayerMp[]
  playerManager: PlayerManager
}

interface Round extends RoundParams {}

/**
 * Class of the round
 */
class Round {
  private roundTimer?: NodeJS.Timeout
  public roundStartDate: number = 0

  constructor(params: RoundParams) {
    Object.assign(this, params)
    this.end              = this.end.bind(this)
  }

  /**
   * Event of starting round
   */
  @logMethod(DEBUG)
  start(): void {
    this.roundTimer       = setTimeout(this.end, this.roundTimeInterval)
    this.roundStartDate   = Date.now()

    this.players.forEach(player => this.prepare(player))

    mp.events.call(SHARED.EVENTS.SERVER_ROUND_START, this.roundStartDate, this.players)
  }

  /**
   * Invoke all the events when the round ends
   */
  @logMethod(DEBUG)
  end(): void {
    /* clear timer and date variables */
    if (this.roundTimer) clearTimeout(this.roundTimer)

    this.roundTimer       = undefined
    this.roundStartDate   = 0
    const teamWinner      = this.getTeamWinner()

    this.players.forEach(player => this.prepareEnd(player))

    mp.events.call(SHARED.EVENTS.SERVER_ROUND_END, teamWinner)
  }

  /**
   * Toggle pause
   * @param {boolean} toggle - on/off pause
   */
  togglePause(toggle: boolean): void {
    return toggle
      ? this.pause()
      : this.unpause()
  }

  /**
   * Pausing a round
   */
  pause(): void {
    if (this.roundTimer) clearTimeout(this.roundTimer)

    this.roundTimer = undefined

    const currentDate         = Date.now()
    const timePassedMs        = currentDate - this.roundStartDate
    this.roundTimeInterval    = this.roundTimeInterval - timePassedMs

    this.players.forEach(player => player.call(SHARED.EVENTS.SERVER_ROUND_PAUSE, [true]))
  }

  /**
   * Unpausing round
   */
  unpause(): void {
    /* call end of the round is interval was ended or broken */
    if (this.roundTimeInterval < 0) return this.end()

    this.roundStartDate   = Date.now()
    this.roundTimer       = setTimeout(this.end, this.roundTimeInterval)
    this.players.forEach(player => player.call(SHARED.EVENTS.SERVER_ROUND_PAUSE, [false]))
  }

  /**
   * Prepare the player to start a new round
   * @param {PlayerMp} player 
   */
  prepare(player: PlayerMp, hasAdded: boolean = false): boolean {
    const teamId = this.playerManager.getTeam(player)
    const vector = this.dummyMapManager.getRandomSpawnVector(this.mapId, teamId)

    player.dimension = this.dimension.round

    this.playerManager.setState(player, SHARED.STATE.ALIVE)
    this.playerManager.spawn(player, vector)

    player.call(SHARED.EVENTS.SERVER_ROUND_START, [this.mapId, this.players.map(ppl => ppl.id), this.roundTimeInterval])

    if (!hasAdded) {
      this.playerManager.success(player, SHARED.MSG.ROUND_START_MESSAGE, this.mapId.toString())
    }

    return true
  }

  /**
   * Prepare the player to end a round
   * @param {PlayerMp} player 
   */
  prepareEnd(player: PlayerMp, hasRemoved: boolean = false): boolean {
    player.dimension = this.dimension.lobby
    player.call(SHARED.EVENTS.SERVER_ROUND_END, [this.mapId])

    this.playerManager.setState(player, SHARED.STATE.IDLE)
    this.playerManager.spawn(player, this.lobby)
    
    if (!hasRemoved) {
      this.playerManager.success(player, SHARED.MSG.ROUND_STOP_MESSAGE)
    }

    return true
  }

  /**
   * Add a new player to the round
   * @param {PlayerMp} player 
   */
  addToRound(player: PlayerMp): boolean {
    if (this.players.find(pl => pl.id === player.id && pl.type === player.type)) return false

    const hasAdded = true
    this.players = [...this.players, player]
    this.prepare(player, hasAdded)

    return true
  }

  /**
   * Remove a player from the round
   * @param {PlayerMp} player 
   */
  removeFromRound(player: PlayerMp): boolean {
    const players = this.players.filter(pl => {
      return player.type !== pl.type || player.id !== pl.id
    })

    if (players.length === this.players.length) return false

    const hasRemoved = true
    this.players = players
    this.prepareEnd(player, hasRemoved)

    return true  
  }

  /**
   * Check if player in the round
   * @param {PlayerMp} player 
   */
  hasPlayer(player: PlayerMp): boolean {
    return this.players.some(ppl => ppl.id === player.id)
  }

  /**
   * Fires an event when player is dead
   * @param {PlayerMp} player victim, the player who died
   * @param {number}   reason cause hash of death
   * @param {PlayerMp} killer who killed the player
   */
  @logMethod(DEBUG)
  playerDeath(player: PlayerMp, reason: number, killer?: PlayerMp): void {
    this.removeFromRound(player)
  }

  /**
   * Fires an event when player has left from the server
   * @param {PlayerMp} player player, who has left from the server
   * @param {string}   exitType one type of these types: "disconnect" | "timeout" | "kicked"
   * @param {string}   reason the reason why player has been kicked
   */
  @logMethod(DEBUG)
  playerQuit(player: PlayerMp, exitType: "disconnect" | "timeout" | "kicked", reason: string): void {
    this.removeFromRound(player)
  }

  /**
   * Does the round have any alive players
   * @param {SHARED.TEAMS} teamId - (optional) team id in the round
   */
  hasAlivePlayers(teamId?: SHARED.TEAMS): boolean {
    if (!teamId) return !!this.players.length

    return !!this.getAlivePlayers(teamId)
  }

  /**
   * Get all alive players by the team
   * @param {SHARED.TEAMS} teamId 
   */
  getAlivePlayers(teamId: SHARED.TEAMS): number {
    return this.players
      .filter(player => this.playerManager.getTeam(player) === teamId)
      .length
  }

  /**
   * Get team winner
   */
  getTeamWinner(): SHARED.TEAMS | false {
    const attackers = this.getAlivePlayers(SHARED.TEAMS.ATTACKERS)
    const defenders = this.getAlivePlayers(SHARED.TEAMS.DEFENDERS)

    if (attackers === defenders) return false

    return attackers > defenders
      ? SHARED.TEAMS.ATTACKERS
      : SHARED.TEAMS.DEFENDERS
  }

  /**
   * Getter of the current state round of the round
   */
  get isRunning(): boolean {
    return this.roundStartDate > 0
  }

  /**
   * Getter of the current state round of the round
   */
  get isPaused(): boolean {
    return this.isRunning && typeof this.roundTimer === 'undefined'
  }
}

export { Round }