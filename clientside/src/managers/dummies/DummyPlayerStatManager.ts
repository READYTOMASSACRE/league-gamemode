import { Dummy } from "../../entities/Dummy"
import { singleton, injectable } from "tsyringe"
import { Language } from "../../core/Language"

/**
 * Class to manage player stats through the dummies
 */
@singleton()
@injectable()
class DummyPlayerStatManager {
  private readonly type = SHARED.ENTITIES.PLAYER_STAT
  private dummies: Map<number, Dummy<SHARED.ENTITIES.PLAYER_STAT>> = new Map()

  constructor(readonly lang: Language) {}

  /**
   * Register all existing dummies
   */
  registerDummies(): void {
    if (this.size === this.dummies.size) return

    this.dummies = new Map()
    mp.dummies.forEachByType(this.type, entity => {
      const dummy = new Dummy(this.type, entity)
      if (typeof dummy.data.id !== 'undefined') {
        this.dummies.set(dummy.data.id, dummy)
      }
    })
  }

  /**
   * Get the players info
   * @param {TYPES.KeyNumberCollection} pings - (optional) players' ping
   */
  getPlayersInfo(pings?: TYPES.KeyNumberCollection): Map<SHARED.TEAMS, any[]> {
    const playerTeams = new Map<SHARED.TEAMS, any[]>()

    playerTeams.set(SHARED.TEAMS.ATTACKERS, [])
    playerTeams.set(SHARED.TEAMS.DEFENDERS, [])
    playerTeams.set(SHARED.TEAMS.SPECTATORS, [])

    this
      .toArray()
      .forEach(dummy => {
        const playerInfo = this.getPlayerInfo(dummy, pings)

        if (playerInfo) {
          const teamId = dummy.data.teamId
          if (teamId) playerTeams.set(teamId, [...playerTeams.get(teamId)!, playerInfo])
        }
      })

    return playerTeams
  }

  /**
   * @todo set interface 
   * 
   * Get the player's info
   * @param {Dummy<SHARED.ENTITIES.PLAYER_STAT>} dummy - the dummy of player stat
   * @param {TYPES.KeyNumberCollection} pings - (optional) players' ping
   */
  private getPlayerInfo(dummy: Dummy<SHARED.ENTITIES.PLAYER_STAT>, pings?: TYPES.KeyNumberCollection): any | false {
    const player = mp.players.atRemoteId(dummy.data.id)

    if (mp.players.exists(player)) {
      const damage = Object
        .values(dummy.data.damage)
        .reduce((accumulator, currentValue) => accumulator! + currentValue!, 0)

      const ping = pings && typeof pings[player.remoteId] !== 'undefined'
        ? pings[player.remoteId]
        : ''

      return {
        name    : player.name,
        state   : player.sharedData && this.getState(player.sharedData.state) || '',
        kill    : dummy.data.kill,
        death   : dummy.data.death,
        assist  : dummy.data.assist,
        lvl     : 0,
        damage  : damage,
        ping    : ping,
      }
    }

    return false
  }

  /**
   * Get the state name by id
   * @param {SHARED.STATE} id - state id
   */
  private getState(id: SHARED.STATE): string {
    const states = {
      [SHARED.STATE.ALIVE]    : this.lang.get(SHARED.MSG.ALIVE),
      [SHARED.STATE.DEAD]     : this.lang.get(SHARED.MSG.DEAD),
      [SHARED.STATE.IDLE]     : this.lang.get(SHARED.MSG.IDLE),
      [SHARED.STATE.SELECT]   : this.lang.get(SHARED.MSG.SELECT),
    }

    return states[id] || ""
  }

  /**
   * Convert to array dummies
   */
  toArray(): Dummy<SHARED.ENTITIES.PLAYER_STAT>[] {
    this.registerDummies()

    const dummies: Dummy<SHARED.ENTITIES.PLAYER_STAT>[] = []
    this.dummies.forEach(dummy => dummies.push(dummy))

    return dummies
  }

  get size(): number {
    let count = 0

    mp.dummies.forEachByType(this.type, () => count++)

    return count
  }
}

export { DummyPlayerStatManager }