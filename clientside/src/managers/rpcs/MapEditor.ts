import { MechanicsManager } from "../MechanicsManager"
import { ErrorHandler } from "../../core/ErrorHandler"
import { commandable, command, eventable, event } from "rage-decorators"
import { DialogManager } from "../DialogManager"
import { DummyLanguageManager } from "../dummies/DummyLanguageManager"
import { keyBind, keyUnbind } from "../../utils"
import { SpawnVector } from "../../mechanics/DrawRoutes"

interface Point {
  name: string
  coord: Vector3Mp
}

type SpawnVectorState = {
  [SHARED.TEAMS.ATTACKERS]: Point[]
  [SHARED.TEAMS.DEFENDERS]: Point[]
}

interface MapEditorState {
  editing: boolean
  path: Point[]
  spawn: SpawnVectorState
  team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS
  mapName: string
  focus: boolean
}

type State = Partial<MapEditorState>

const initialState = {
  path: [] as Point[],
  spawn: {
    [SHARED.TEAMS.ATTACKERS]: [],
    [SHARED.TEAMS.DEFENDERS]: []
  },
  team: SHARED.TEAMS.ATTACKERS as SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS,
  editing: false,
  focus: false,
  mapName: '',
}

/**
 * Rpc handler - Map editor
 */
@commandable()
@eventable()
class MapEditor {
  private toggle: boolean = false
  private state: State = Object.assign({}, initialState)

  constructor(
    readonly mechanics: MechanicsManager,
    readonly errHandler: ErrorHandler,
    readonly dialog: DialogManager,
    readonly lang: DummyLanguageManager,
  ) {
    // toggling handlers
    this.toggleEditor               = this.toggleEditor.bind(this)
    this.toggleVisible              = this.toggleVisible.bind(this)
    this.toggleChat                 = this.toggleChat.bind(this)

    // request from cef or from key binds
    this.resetRequest               = this.resetRequest.bind(this)
    this.saveRequest                = this.saveRequest.bind(this)
    this.addPointRequest            = this.addPointRequest.bind(this)
    this.removePointRequest         = this.removePointRequest.bind(this)
    this.addSpawnPointRequest       = this.addSpawnPointRequest.bind(this)
    this.removeSpawnPointRequest    = this.removeSpawnPointRequest.bind(this)
    this.updateStateRequest         = this.updateStateRequest.bind(this)

    // key binds
    this.invokeStart                = this.invokeStart.bind(this)
    this.invokeSwitchTeam           = this.invokeSwitchTeam.bind(this)
    this.invokeRemoveLastPoint      = this.invokeRemoveLastPoint.bind(this)
    this.invokeRemoveLastSpawnPoint = this.invokeRemoveLastSpawnPoint.bind(this)
    this.invokeAddSpawnPoint        = this.invokeAddSpawnPoint.bind(this)

    // result from serverside
    this.addResult                  = this.addResult.bind(this)
  }

  /**
   * Event
   * 
   * Fires from the serverside to send a result of adding a new map
   * @param {boolean} result 
   */
  @event(SHARED.EVENTS.SERVER_MAP_EDITOR_ADD_RESULT)
  addResult(result: boolean): void {
    if (result === true) this.clear()
  }

  /**
   * Event
   * 
   * Fires when a player should toggle map editor state
   * @param {boolean} toggle 
   */
  @event(SHARED.EVENTS.SERVER_MAP_EDITOR_TOGGLE)
  toggleEditor(toggle: boolean): void {
    try {
      if (toggle === true) {
        this.mechanics.startRoute()
        this.mechanics.fly.toggle(true)
        this.toggleVisible(true)
        this.bindKeys()
      } else {
        this.mechanics.stopRoute()
        this.mechanics.fly.toggle(false)
        this.toggleVisible(false)
        this.toggleChat(true)
        this.unbindKeys()
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Enable map editor
   */
  toggleVisible(toggle?: boolean): void {
    if (typeof toggle !== 'undefined') {
      this.toggle = toggle
    } else {
      if (this.isTyping()) return

      this.toggle = !this.toggle
    }

    this.dialog.call(SHARED.RPC_DIALOG.CLIENT_MAP_EDITOR_TOGGLE, this.toggle)
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client should update a map editor state
   * @param {State} state 
   */
  updateStateRequest(state: State): void {
    this.state = state
    this.toggleChat(this.isFocused() !== true)
  }

  /**
   * Invoke a start map editor state
   */
  invokeStart(): void {
    if (this.isTyping() || this.isEditing()) return
    
    this.dialog.call(SHARED.RPC_DIALOG.CLIENT_MAP_EDITOR_UPDATE, { editing: true })
  }

  /**
   * Switch team in the map editor's state
   */
  invokeSwitchTeam(): void {
    if (this.isTyping() || !this.isEditing()) return

    const team = this.state.team === SHARED.TEAMS.ATTACKERS
      ? SHARED.TEAMS.DEFENDERS
      : SHARED.TEAMS.ATTACKERS

    this.dialog.call(SHARED.RPC_DIALOG.CLIENT_MAP_EDITOR_UPDATE, { team })
  }

  /**
   * Add a spawn point
   */
  invokeAddSpawnPoint(): void {
    if (this.isTyping() || !this.isEditing()) return

    if (typeof this.state.team !== 'undefined') {
      this.addSpawnPointRequest(this.state.team)
    }
  }

  /**
   * Remove last point
   */
  invokeRemoveLastPoint(): void {
    if (this.isTyping() || !this.isEditing()) return

    if (typeof this.state.path !== 'undefined' && this.state.path.length) {
      this.removePointRequest(this.state.path.length-1)
    }
  }

  /**
   * Remove last spawn point
   */
  invokeRemoveLastSpawnPoint(): void {
    if (this.isTyping() || !this.isEditing()) return

    const { spawn, team } = this.state
    if (
      typeof spawn !== 'undefined'
      && typeof team !== 'undefined'
    ) {
      const length = spawn[team].length
      if (!length) return

      this.removeSpawnPointRequest([team, length - 1])
    }
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to reset the map editor
   */
  resetRequest(): void {
    if (this.isTyping() || !this.isEditing()) return

    this.clear()
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to save the map editor
   */
  saveRequest(): void {
    if (this.isTyping() || !this.isEditing()) return

    const payload = JSON.stringify(this.state)
    mp.events.callRemote(SHARED.EVENTS.CLIENT_MAP_EDITOR_ADD_MAP, payload)
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to add a new point
   */
  addPointRequest(): void {
    if (this.isTyping() || !this.isEditing()) return

    this.mechanics.addPoint()
    this.updateState()
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to remove a point
   */
  removePointRequest(index: number): void {
    if (this.isTyping() || !this.isEditing()) return

    this.mechanics.removePoint(index)
    this.updateState()
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to add a new spawn point
   */
  addSpawnPointRequest(team: SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS): void {
    if (this.isTyping() || !this.isEditing()) return

    this.mechanics.addSpawnPoint(team)
    this.updateState()
  }

  /**
   * RPC Call
   * 
   * Fires from the CEF when a client wants to remove a spawn point
   */
  removeSpawnPointRequest([team, index]: [SHARED.TEAMS.ATTACKERS | SHARED.TEAMS.DEFENDERS, number]): void {
    if (this.isTyping() || !this.isEditing()) return

    this.mechanics.removeSpawnPoint(team, index)
    this.updateState()
  }

  /**
   * Toggle chat key
   */
  toggleChat(toggle: boolean): void {
    mp.gui.chat.activate(toggle)
  }

  /**
   * Bind keys
   */
  private bindKeys(): void {
    keyBind([ENUMS.KEYCODES.VK_2], false, this.invokeStart)
    keyBind([ENUMS.KEYCODES.VK_3], false, this.resetRequest)
    keyBind([ENUMS.KEYCODES.VK_4], false, this.saveRequest)
    keyBind([ENUMS.KEYCODES.VK_5], false, this.toggleVisible)
    keyBind([ENUMS.KEYCODES.VK_E], false, this.addPointRequest)
    keyBind([ENUMS.KEYCODES.VK_R], false, this.invokeAddSpawnPoint)
    keyBind([ENUMS.KEYCODES.VK_F], false, this.invokeSwitchTeam)
    keyBind([ENUMS.KEYCODES.VK_X], false, this.invokeRemoveLastPoint)
    keyBind([ENUMS.KEYCODES.VK_C], false, this.invokeRemoveLastSpawnPoint)
    keyBind([ENUMS.KEYCODES.VK_T], false, this.toggleChat)
  }

  /**
   * Unbind keys
   */
  private unbindKeys(): void {
    keyUnbind([ENUMS.KEYCODES.VK_2], false, this.invokeStart)
    keyUnbind([ENUMS.KEYCODES.VK_3], false, this.resetRequest)
    keyUnbind([ENUMS.KEYCODES.VK_4], false, this.saveRequest)
    keyUnbind([ENUMS.KEYCODES.VK_5], false, this.toggleVisible)
    keyUnbind([ENUMS.KEYCODES.VK_E], false, this.addPointRequest)
    keyUnbind([ENUMS.KEYCODES.VK_R], false, this.invokeAddSpawnPoint)
    keyUnbind([ENUMS.KEYCODES.VK_F], false, this.invokeSwitchTeam)
    keyUnbind([ENUMS.KEYCODES.VK_X], false, this.invokeRemoveLastPoint)
    keyUnbind([ENUMS.KEYCODES.VK_C], false, this.invokeRemoveLastSpawnPoint)
    keyUnbind([ENUMS.KEYCODES.VK_T], false, this.toggleChat)
  }

  /**
   * Check if player is typing in chat
   */
  private isTyping(): boolean {
    const { focus = false } = this.state

    return mp.players.local.isTypingInTextChat || focus
  }

  /**
   * Check if map editor has started
   */
  private isEditing(): boolean {
    const { editing = false } = this.state

    return editing
  }

  /**
   * Check if map editor input is focused
   */
  private isFocused(): boolean {
    const { focus = false } = this.state

    return focus
  }

  /**
   * Reset the current state
   */
  private clear(): void {
    this.mechanics.clearRoute()
    this.dialog.call(SHARED.RPC_DIALOG.CLIENT_MAP_EDITOR_UPDATE, initialState)
  }

  /**
   * Update paths && spawn points in the state of map editor
   */
  private updateState(): void {
    const path = this.getPath()
    const spawn = this.getSpawn()

    this.dialog.call(SHARED.RPC_DIALOG.CLIENT_MAP_EDITOR_UPDATE, {
      path: this.formatPath(path.map(vec2 => new mp.Vector3(vec2.x, vec2.y, 0))),
      spawn: this.formatSpawn(spawn)
    })
  }

  /**
   * Get spawn
   */
  private getSpawn(): SpawnVector {
    return this.mechanics.drawRoutes.getSpawn()
  }

  /**
   * Get path
   */
  private getPath(): SHARED.TYPES.Vector2[] {
    return this.mechanics.drawRoutes.getPath()
  }

  /**
   * Return formatted points to update a map editor state
   * @param {Vector3Mp} vectors 
   */
  private formatPath(vectors: Vector3Mp[]): Point[] {
    return vectors.map((vector: Vector3Mp, index) => ({
      name: this.getName(index),
      coord: vector,
    }))
  }

  /**
   * Return formatted spawn points to update a map editor state
   * @param {Vector3Mp} vectors 
   */
  private formatSpawn(spawnVector: SpawnVector): SpawnVectorState {
    return {
      [SHARED.TEAMS.ATTACKERS]: this.formatPath(spawnVector[SHARED.TEAMS.ATTACKERS]),
      [SHARED.TEAMS.DEFENDERS]: this.formatPath(spawnVector[SHARED.TEAMS.DEFENDERS]),
    }
  }
  
  /**
   * Format a point name
   * @param {number} index
   */
  private getName(index: number): string {
    return this.lang.get(SHARED.MSG.MAP_EDITOR_POINT_NAME) + (index + 1)
  }
}

export { MapEditor }