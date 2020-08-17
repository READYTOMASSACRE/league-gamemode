import { injectable, singleton } from "tsyringe"
import { WeaponManager } from "./WeaponManager"
import { RoundManager } from "./RoundManager"
import { register } from "rage-rpc"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"
import { ErrorHandler } from "../core/ErrorHandler"
import { RoundIsNotRunningError } from "../errors/PlayerErrors"
import { PlayerProfileManager } from "./PlayerProfileManager"
import { RoundStatManager } from "./RoundStatManager"
import { CEFProfileDTO } from "../db/entity/Profile"
import { ObjectID } from "typeorm"

/**
 * Class to manage RPC class
 * @todo will be replaced with callProc when it will be in the branch prerelease or above
 */
@injectable()
@singleton()
class RpcManager implements INTERFACES.Manager {
  constructor(
    readonly weaponManager: WeaponManager,
    readonly roundManager: RoundManager,
    readonly profileManager: PlayerProfileManager,
    readonly roundStatManager: RoundStatManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.clientWeaponRequest        = this.clientWeaponRequest.bind(this)
    this.clientPingRequest          = this.clientPingRequest.bind(this)
    this.cefGamemenuProfile         = this.cefGamemenuProfile.bind(this)
    this.cefGamemenuPlayers         = this.cefGamemenuPlayers.bind(this)
    this.cefGamemenuHistory         = this.cefGamemenuHistory.bind(this)
    this.cefGamemenuTop             = this.cefGamemenuTop.bind(this)
    this.cefGamemenuVoteNominate    = this.cefGamemenuVoteNominate.bind(this)
  }

  /**
   * Register all rpc calls
   */
  @logMethod(DEBUG)
  load(): void {
    // weaponManager
    register(SHARED.RPC.CLIENT_WEAPON_REQUEST, this.clientWeaponRequest)
    register(SHARED.RPC.CLIENT_PING_REQUEST, this.clientPingRequest)

    // CEF GameMenu
    register(SHARED.RPC.CEF_GAMEMENU_PROFILE, this.cefGamemenuProfile)
    register(SHARED.RPC.CEF_GAMEMENU_PLAYERS, this.cefGamemenuPlayers)
    register(SHARED.RPC.CEF_GAMEMENU_HISTORY, this.cefGamemenuHistory)
    register(SHARED.RPC.CEF_GAMEMENU_TOP, this.cefGamemenuTop)
    register(SHARED.RPC.CEF_GAMEMENU_VOTE_NOMINATE, this.cefGamemenuVoteNominate)
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when the client has choiced the weapon
   * @param {string[]} choice - the player choice of weapons
   * @param {rpc.ProcedureListenerInfo} rpcListenerInfo 
   */
  clientWeaponRequest(choice: string[], rpcListenerInfo: rpc.ProcedureListenerInfo): void {
    try {
      if (!this.roundManager.isRoundRunning) {
        throw new RoundIsNotRunningError(
          SHARED.MSG.ERR_ROUND_IS_NOT_RUNNING,
          rpcListenerInfo.player as PlayerMp
        )
      }
  
      this.weaponManager.weaponRequest(choice, rpcListenerInfo)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * RPC Call
   * 
   * Fires from the clientside when the client is waiting the players' ping
   */
  clientPingRequest(): KeyValueCollection {
    const pings: KeyValueCollection = {}
    mp.players.forEach(player => {
      if (mp.players.exists(player)) pings[player.id] = player.ping
    })

    return pings
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when the client has requested profile
   */
  cefGamemenuProfile(id: number | null = null, listener: rpc.ProcedureListenerInfo): CEFProfileDTO | undefined {
    try {
      let player = listener.player as PlayerMp

      if (typeof id === 'number' && mp.players.at(id)) {
        player = mp.players.at(id)
      }
  
      if (mp.players.exists(player)) {
        return this.profileManager
          .getDomain(player)
          .toCefProfileDto()
      } 
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when the client has requested profile
   */
  cefGamemenuPlayers(_: any, listener: rpc.ProcedureListenerInfo): any {
    try {
      const payload: any = { players: [] }

      mp.players.forEach(player => {
        let mmr = 0
        if (player.sharedData.profile) {
          mmr = player.sharedData.profile.mmr
        }
        payload.players.push({
          id: player.id,
          name: player.name,
          mmr,
        })
      })

      return payload
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * @todo return top of players
   * RPC Call
   * 
   * Fires from CEF when a client has requested a top of players
   */
  async cefGamemenuTop(_: any, listener: rpc.ProcedureListenerInfo): Promise<any> {
    try {
      if (this.profileManager.repository) {
        const players = await this.profileManager.repository.getTopPlayers()
        return {
          players: players.map((ppl, index) => ({
            id: index,
            name: ppl.state.name,
            mmr: ppl.state.mmr,
          }))
        }
      } else {
        return { players: [] }
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client has requested a history of matches
   * @param {number} id 
   * @param {rpc.ProcedureListenerInfo} listener 
   */
  async cefGamemenuHistory(id: ObjectID | null = null, listener: rpc.ProcedureListenerInfo): Promise<any> {
    const { player }  = listener
    if (id) {
      if (!this.roundStatManager.repository) return {}

      const round = await this.roundStatManager.repository.getMatchById(id)

      if (typeof round === 'undefined') return {}

      return this.roundStatManager.formatCefMatchDetail(player as PlayerMp, round.state)
    } else {
      const matches = await this.roundStatManager.getMatchesLastWeek(player as PlayerMp)

      return { matches }
    }
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client has nominated a map
   * @param {number} id 
   * @param {rpc.ProcedureListenerInfo} listener 
   */
  cefGamemenuVoteNominate(id: number, listener: rpc.ProcedureListenerInfo): void {
    try {
      const { player } = listener
  
      return this.roundManager.vote(player as PlayerMp, id)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { RpcManager }