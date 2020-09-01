import { Hud } from "./Hud"
import { DummyConfigManager, DummyLanguageManager, DialogManager, PlayerManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"

export interface SpectateViewersInformation {
  id: number
  nickname: string
  kill: number
  death: number
  assist: number
}
/**
 * Hud element - spectate
 */
class SpectateViewers extends Hud {
  private player: PlayerMp = mp.players.local

  constructor(
    readonly dummyConfig    : DummyConfigManager,
    readonly lang           : DummyLanguageManager,
    readonly errHandler     : ErrorHandler,
    readonly dialogManager  : DialogManager,
    readonly playerManager  : PlayerManager,
  ) {
    super(dummyConfig, lang, errHandler)
  }

  /**
   * @inheritdoc
   */
  start(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_VIEWERS_TOGGLE, true)
    this.player = mp.players.local
    this.startTick()
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_VIEWERS_TOGGLE, false)
    this.stopTick()
  }

  /**
   * @inheritdoc
   */
  tick(): void {
    try {
      const players = this.playerManager.getPlayerSpectates(this.player)
      this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_SPECTATE_VIEWERS, { players: players.map(ppl => ppl.name) })

    } catch (err) {
      if (this.errHandler.handle(err)) throw err
      this.stop()      
    }
  }

  /**
   * Update hud information
   * @param {PlayerMp} player 
   */
  update(player: PlayerMp): void {
    this.player = player
    this.tick()
  }
}

export { SpectateViewers }