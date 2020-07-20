import { injectable, singleton, inject } from "tsyringe"
import { WeaponManager } from "./WeaponManager"
import { RoundManager } from "./RoundManager"
import { register } from "rage-rpc"
import { logMethod } from "../utils"
import { DEBUG } from "../bootstrap"
import { ErrorHandler } from "../core/ErrorHandler"
import { RoundIsNotRunningError } from "../errors/PlayerErrors"

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
    @inject(ErrorHandler) readonly errHandler: ErrorHandler,
  ) {
    this.clientWeaponRequest = this.clientWeaponRequest.bind(this)
    this.clientPingRequest   = this.clientPingRequest.bind(this)
  }

  /**
   * Register all rpc calls
   */
  @logMethod(DEBUG)
  load(): void {
    // weaponManager
    register(SHARED.RPC.CLIENT_WEAPON_REQUEST, this.clientWeaponRequest)
    register(SHARED.RPC.CLIENT_PING_REQUEST, this.clientPingRequest)
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
}

export { RpcManager }