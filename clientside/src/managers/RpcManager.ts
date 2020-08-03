import { injectable, singleton } from 'tsyringe'
import { DialogManager } from './DialogManager'
import { register } from 'rage-rpc'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'

/**
 * Class to manage rpc calss
 */
@injectable()
@singleton()
class RpcManager {
  constructor(
    readonly dialogManager: DialogManager,
    readonly dummyMapManager: DummyMapManager,
    readonly dummyConfigManager: DummyConfigManager,
  ) {}

  /**
   * @inheritdoc
   */
  load(): void {
    // dialogManager
    register(SHARED.RPC_DIALOG.CLIENT_DIALOG_OPEN, this.dialogManager.onOpen)
    register(SHARED.RPC_DIALOG.CLIENT_DIALOG_CLOSE, this.dialogManager.onClose)

    // CEF GameMenu
    register(SHARED.RPC.CEF_GAMEMENU_VOTE, this.dummyMapManager.cefVoteRequest)
    register(SHARED.RPC.CEF_GAMEMENU_CREDITS, this.dummyConfigManager.cefCreditsRequest)
  }
}

export { RpcManager }