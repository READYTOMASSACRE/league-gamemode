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
  prepareTime: number
}

interface Round extends RoundParams {}

/**
 * Class of the round
 */
class Round {
  private prepareTimer?   : NodeJS.Timeout
  private roundTimer?     : NodeJS.Timeout
  private started         : boolean = false

  public roundStartDate   : number = 0

  constructor(params: RoundParams) {
    Object.assign(this, params)
    this.end              = this.end.bind(this)
  }

  /**
   * Get started params for sending data to client
   */
  getStartedParams(): any[] {
    return [this.mapId, this.getPlayerIds(), this.getTimeleftMs()]
  }

  /**
   * Event of starting round
   */
  @logMethod(DEBUG)
  start(): void {    
    if (this.prepareTimer) {
      clearTimeout(this.prepareTimer)
      this.prepareTimer = undefined
    }

    this.players.forEach(player => this.prepare(player))
    mp.players.call(this.players, SHARED.EVENTS.SERVER_ROUND_PREPARE, [this.mapId])

    this.prepareTimer = setTimeout(() => {
      this.roundTimer       = setTimeout(this.end, this.roundTimeInterval)
      this.roundStartDate   = Date.now()

      mp.players.call(this.players, SHARED.EVENTS.SERVER_ROUND_START, this.getStartedParams())
      mp.events.call(SHARED.EVENTS.SERVER_ROUND_START, this.roundStartDate, this.players)
      
    }, this.prepareTime)

    this.started = true
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

    mp.events.call(SHARED.EVENTS.SERVER_ROUND_END, teamWinner, this.players)
    mp.players.call(SHARED.EVENTS.SERVER_ROUND_END, [teamWinner])

    this.started = false
  }

  /**
   * Prepare the player to start a new round
   * @param {PlayerMp} player 
   */
  prepare(player: PlayerMp): boolean {
    const teamId = this.playerManager.getTeam(player)
    const vector = this.dummyMapManager.getRandomSpawnVector(this.mapId, teamId)

    player.dimension = this.dimension.round

    this.playerManager.setState(player, SHARED.STATE.ALIVE)
    this.playerManager.spawn(player, vector)

    /** @todo remove it */
    player.health = 99

    return true
  }

  /**
   * Prepare the player to end a round
   * @param {PlayerMp} player 
   */
  prepareEnd(player: PlayerMp, state: SHARED.STATE = SHARED.STATE.IDLE): boolean {
    player.dimension = this.dimension.lobby
    this.playerManager.setState(player, state)

    if (state === SHARED.STATE.IDLE) this.playerManager.spawnInLobby(player)

    return true
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

    this.roundTimer           = undefined
    this.roundTimeInterval    = this.getTimeleftMs()

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
   * Prepare a player to end the round because of death
   * @param {PlayerMp} player 
   */
  prepareDeath(player: PlayerMp): boolean {
    const prepared = this.prepareEnd(player, SHARED.STATE.DEAD)
    if (prepared) player.call(SHARED.EVENTS.SERVER_ROUND_PLAYER_DEATH, [])

    return prepared
  }

  /**
   * Add a new player to the round
   * @param {PlayerMp} player 
   */
  addToRound(player: PlayerMp): boolean {
    if (this.hasPlayer(player)) return false
    
    if (this.prepare(player)) {
      this.players = [...this.players, player]

      player.call(SHARED.EVENTS.SERVER_ROUND_PLAYER_ADD, this.getStartedParams())
      mp.events.call(SHARED.EVENTS.SERVER_ROUND_PLAYER_ADD, player)
  
      return true
    } else {
      return false
    }
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

    const prepared = this.prepareEnd(player)
    if (prepared) {
      this.players = players
      player.call(SHARED.EVENTS.SERVER_ROUND_PLAYER_REMOVE, [])
    }

    return prepared
  }

  /**
   * Check if player in the round
   * @param {PlayerMp} player 
   */
  hasPlayer(player: PlayerMp): boolean {
    return this.players.some(ppl => {
      return ppl.id === player.id
        && this.playerManager.hasState(player, SHARED.STATE.ALIVE)
    })
  }

  /**
   * Fires an event when player is dead
   * @param {PlayerMp} player victim, the player who died
   * @param {number}   reason cause hash of death
   * @param {PlayerMp} killer who killed the player
   */
  @logMethod(DEBUG)
  playerDeath(player: PlayerMp, reason: number, killer?: PlayerMp): void {
    this.prepareDeath(player)
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
    if (!teamId) {
      return !!this
        .players
        .filter(ppl => this.playerManager.getState(ppl) === SHARED.STATE.ALIVE)
        .length
    }

    return !!this.getAlivePlayers(teamId)
  }

  /**
   * Get all alive players by the team
   * @param {SHARED.TEAMS} teamId 
   */
  getAlivePlayers(teamId: SHARED.TEAMS): number {
    return this.players
      .filter(player => (
        this.playerManager.getTeam(player) === teamId
        && this.playerManager.getState(player) === SHARED.STATE.ALIVE
      ))
      .length
  }

  /**
   * Get players' id
   */
  getPlayerIds(): number[] {
    return this.players.map(player => player.id)
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
   * Get round time left
   */
  getTimeleftMs(): number {
    const currentDate   = Date.now()
    const timePassedMs  = currentDate - this.roundStartDate

    return this.roundTimeInterval - timePassedMs
  }

  /**
   * Getter of the current state round of the round
   */
  get isRunning(): boolean {
    return this.started
  }

  /**
   * Getter of the current state round of the round
   */
  get isPaused(): boolean {
    return this.isRunning && typeof this.roundTimer === 'undefined'
  }
}

export { Round }