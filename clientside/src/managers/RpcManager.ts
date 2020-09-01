import { injectable, singleton } from 'tsyringe'
import { DialogManager } from './DialogManager'
import { register } from 'rage-rpc'
import { DummyMapManager } from './dummies/DummyMapManager'
import { DummyConfigManager } from './dummies/DummyConfigManager'
import { MapEditor } from './rpcs/MapEditor'
import { MechanicsManager } from './MechanicsManager'
import { ErrorHandler } from '../core/ErrorHandler'
import { DummyLanguageManager } from './dummies/DummyLanguageManager'

/**
 * Class to manage rpc calss
 */
@injectable()
@singleton()
class RpcManager {
  private mapEditorHandler: MapEditor

  constructor(
    readonly dialogManager: DialogManager,
    readonly dummyMapManager: DummyMapManager,
    readonly dummyConfigManager: DummyConfigManager,
    readonly mechanicsManager: MechanicsManager,
    readonly errHandler: ErrorHandler,
    readonly lang: DummyLanguageManager
  ) {
    this.mapEditorHandler = new MapEditor(mechanicsManager, errHandler, dialogManager, lang)
  }

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

    // map editor
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_RESET, this.mapEditorHandler.resetRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_SAVE, this.mapEditorHandler.saveRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_ADD_POINT, this.mapEditorHandler.addPointRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_REMOVE_POINT, this.mapEditorHandler.removePointRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_ADD_SPAWN_POINT, this.mapEditorHandler.addSpawnPointRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_REMOVE_SPAWN_POINT, this.mapEditorHandler.removeSpawnPointRequest)
    register(SHARED.RPC_DIALOG.CEF_MAP_EDITOR_UPDATE_CLIENT, this.mapEditorHandler.updateStateRequest)
  }
}

export { RpcManager }