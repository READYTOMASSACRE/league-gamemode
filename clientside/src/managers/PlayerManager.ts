import { Vector2 } from "../utils"
import { DialogManager } from "./DialogManager"
import { BrowserManager } from "./BrowserManager"
import { singleton, autoInjectable } from "tsyringe"
import { command, commandable, eventable, event } from "rage-decorators"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { ErrorHandler } from "../core/ErrorHandler"

export const SHARED_DATA = "sharedData"
const SETTER_NOT_ALLOWED = false

/**
 * Class to manage the local player's interactions
 */
@singleton()
@autoInjectable()
@commandable()
@eventable()
class PlayerManager {
  private cursor: boolean = false
  public readonly player: PlayerMp = mp.players.local
  private isFreezed: boolean = false

  constructor(
    readonly dialogManager: DialogManager,
    readonly browserManager: BrowserManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.weaponDialog         = this.weaponDialog.bind(this)
    this.toggleCursor         = this.toggleCursor.bind(this)
    this.initData             = this.initData.bind(this)
    this.playerJoin           = this.playerJoin.bind(this)
    this.changeLanguage       = this.changeLanguage.bind(this)
  }

  /**
   * Event
   * 
   * Fires when when a player joins the server
   * Adding the sharedData to the player
   * @param {PlayerMp} player 
   */
  @event(RageEnums.EventKey.PLAYER_JOIN)
  playerJoin(player: PlayerMp): void {
    try {
      if (
        player.handle !== this.player.handle
        && !player.sharedData
      ) {
        this.initSharedData(player, SETTER_NOT_ALLOWED)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Shows/hides the cursor
   */
  @command("cursor")
  toggleCursor(): void {
    this.cursor = !this.cursor
    mp.gui.cursor.visible = this.cursor
  }

  /**
   * Command
   * 
   * Get an access to change the current language
   * @param {string} cmdDesc 
   * @param {string} lang - code of the language
   */
  @command(["cl", "changelang"], { desc: "{{cmdName}}" })
  changeLanguage(cmdDesc: string, lang: string): void {
    try {
      if (!lang) {
        mp.gui.chat.push(
          this.lang
            .get(SHARED.MSG.CMD_CHANGE_LANG)
            .replace("{{cmdName}}", cmdDesc)
        )
      } else {
        this.loadLanguage(lang)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Load the available language
   * @param {string} lang 
   */
  loadLanguage(lang: string): void {
    try {
      const messages = this.lang.getMessages(lang)
      this.player.sharedData.lang = lang
      this.browserManager.callBrowser(ENUMS.CEF.MAIN, SHARED.RPC.CLIENT_LANGUAGE, messages)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Init custom and shared data
   */
  initData(): void {
    this.initCustomData()
    this.initSharedData(this.player)
    mp.players.forEach(player => {
      if (
        player.handle !== this.player.handle
        && !player.sharedData
      ) {
        this.initSharedData(player, SETTER_NOT_ALLOWED)
      }
    })
  }

  /**
   * Provide init custom data
   */
  private initCustomData(): void {
    this.player.customData = {
      isSelecting: false,
      assist: {},
    }

    Object.defineProperty(this.player, 'vector2', {
      get: () => new Vector2([this.player.position.x, this.player.position.y])
    })
  }

  /**
   * Helper function to set custom data
   * @param {K} key 
   * @param {TYPES.PlayerCustomData[K]} value 
   */
  setCustomData<K extends keyof TYPES.PlayerCustomData>(key: K, value: TYPES.PlayerCustomData[K]): void {
    this.player.customData[key] = value
  }

  /**
   * Helper function to get custom data
   * @param {K} key 
   * @param {TYPES.PlayerCustomData[K]} value 
   */
  getCustomData<K extends keyof TYPES.PlayerCustomData>(key: K) : TYPES.PlayerCustomData[K] {
    return this.player.customData[key]
  }

  /**
   * Provider to init shared data
   * @param {PlayerMp} player - the player who should init the shared data
   * @param {boolean} setterAllowed - the flag which allow to set the shared data (local player only)
   */
  private initSharedData(player: PlayerMp, setterAllowed: boolean = true): void {
    const proxyHandler: ProxyHandler<any> = {
      get: (target: any, key: string) => {
        return this.getSharedData(player, target, key)
      }
    }
    if (setterAllowed) {
      proxyHandler.set = (target: any, key: string, value: any) => this.setSharedData(target, key, value)
    }

    player.sharedData = new Proxy({} as SHARED.TYPES.SharedData, proxyHandler)
  }

  /**
   * Helper function to set shared data (local player only)
   * @param {any} target
   * @param {string | number | symbol} key 
   * @param {any} value 
   */
  private setSharedData(target: any, key: string | number | symbol, value: any): boolean {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_SET_SHARED_DATA, key, value)

    return true
  }

  /**
   * Helper function to get shared data
   * @param {PlayerMp} player - the player which sharedData should be getting
   * @param {any} target
   * @param {string | number | symbol} key 
   * @param {any} value 
   */
  private getSharedData(player: PlayerMp, target: any, key: string | number | symbol): any {
    const sharedData = player.getVariable(SHARED_DATA)

    return sharedData && typeof sharedData[key] !== 'undefined'
      ? sharedData[key]
      : undefined
  }

  /**
   * Helper function to set player data, such as position, model and etc.
   * @param {any} object
   */
  setPlayerData(object: any): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_SET_PLAYER_DATA, JSON.stringify(object))
  }

  /**
   * Set the player's state
   * @param {SHARED.STATE} state 
   */
  setState(state: SHARED.STATE): void {
    this.player.sharedData.state = state
  }

  /**
   * Get the player's state
   * @param {PlayerMp} player (optional)
   */
  getState(player?: PlayerMp): SHARED.STATE {
    return player && player.sharedData.state || this.player.sharedData.state
  }

  /**
   * Check if the player has a state/states
   * @param {SHARED.STATE | SHARED.STATE[]} state
   * @param {PlayerMp} player (optional)
   */
  hasState(state: SHARED.STATE | SHARED.STATE[], player?: PlayerMp) {
    state = Array.isArray(state) && state || [state]

    return state.indexOf(player && this.getState(player) || this.getState()) !== -1
  }

  /**
   * Set the player's team
   * @param {SHARED.TEAMS} teamId 
   */
  setTeam(teamId: SHARED.TEAMS): void {
    this.player.sharedData.teamId = teamId
  }

  /**
   * Get the player's team
   * @param {PlayerMp} player
   */
  getTeam(player?: PlayerMp): SHARED.TEAMS {
    return player && player.sharedData.teamId || this.player.sharedData.teamId
  }

  /**
   * Set the player's model
   * @param {number} model 
   */
  setModel(model: number): void {
    this.setPlayerData({ model })
  }

  /**
   * Spawn the player into the lobby
   */
  spawnInLobby(): void {
    mp.events.callRemote(SHARED.EVENTS.CLIENT_SPAWN_IN_LOBBY)
  }

  /**
   * Open the weapon dialog
   */
  weaponDialog(): void {
    this.dialogManager.call(SHARED.RPC_DIALOG.CLIENT_WEAPON_DIALOG_OPEN)
  }

  /**
   * Return players with state
   * @param {SHARED.STATE | SHARED.STATE[]} state
   */
  getPlayersWithState(state: SHARED.STATE | SHARED.STATE[]): PlayerMp[] {
    const states = Array.isArray(state) && state || [state]
    const players: PlayerMp[] = []

    mp.players.forEach(player => {
      if (
        mp.players.exists(player)
        && player.sharedData
        && states.indexOf(player.sharedData.state) !== -1
      ) {
        players.push(player)
      }
    })

    return players
  }

  /**
   * Freeze a player
   */
  freeze(toggle: boolean): void {
    if (toggle !== this.isFreezed) {
      if (toggle) {
        mp.events.add(RageEnums.EventKey.RENDER, this.disableAllControlActions)
      } else {
        mp.events.remove(RageEnums.EventKey.RENDER, this.disableAllControlActions)
      }
      this.isFreezed = toggle
    }
  }

  /**
   * Disable game control actions in second input group
   */
  private disableAllControlActions(): void {
    mp.game.controls.disableAllControlActions(2)
  }
}

export { PlayerManager }