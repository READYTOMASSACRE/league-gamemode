import { injectable, singleton } from 'tsyringe'
import { DialogManager } from './DialogManager'
import { register } from 'rage-rpc'

/**
 * Class to manage rpc calss
 */
@injectable()
@singleton()
class RpcManager {
  constructor(readonly dialogManager: DialogManager) {}

  /**
   * @inheritdoc
   */
  load(): void {
    // dialogManager
    register(SHARED.RPC_DIALOG.CLIENT_DIALOG_OPEN, this.dialogManager.onOpen)
    register(SHARED.RPC_DIALOG.CLIENT_DIALOG_CLOSE, this.dialogManager.onClose)
  }
}

export { RpcManager }