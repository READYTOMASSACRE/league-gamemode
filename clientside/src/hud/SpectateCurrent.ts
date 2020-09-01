import { Hud } from "./Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager, DummyPlayerStatManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"

export interface SpectateCurrentInformation {
  id: number
  nickname: string
  kill: number
  death: number
  assist: number
}
/**
 * Hud element - spectate
 */
class SpectateCurrent extends Hud {
  constructor(
    readonly dummyConfig          : DummyConfigManager,
    readonly lang                 : DummyLanguageManager,
    readonly errHandler           : ErrorHandler,
    readonly dialogManager        : DialogManager,
    readonly playerStatManager    : DummyPlayerStatManager,
  ) {
    super(dummyConfig, lang, errHandler)
  }

  /**
   * @inheritdoc
   */
  start(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_CURRENT_TOGGLE, true)
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_CURRENT_TOGGLE, false)
  }

  /**
   * Update hud information
   * @param {PlayerMp} player 
   */
  update(player: PlayerMp): void {
    try {
      const payload: SpectateCurrentInformation = {
        id: player.remoteId,
        nickname: player.name,
        kill: 0,
        death: 0,
        assist: 0
      }
  
      const kda = this.playerStatManager.getPlayerKDA(player)
      if (typeof kda !== 'undefined') {
        payload.kill = kda.kill
        payload.death = kda.death
        payload.assist = kda.assist
      }
  
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_CURRENT, payload)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
      this.stop()
    }
  }
}

export { SpectateCurrent }