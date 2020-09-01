import { TeamSelector } from "../interactions/TeamSelector"
import { PlayerManager } from "./PlayerManager"
import { TeamManager } from "./TeamManager"
import { singleton, autoInjectable } from "tsyringe"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { command, commandable, eventable, event } from "rage-decorators"
import { ErrorHandler } from "../core/ErrorHandler"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { HudManager } from "./HudManager"
import { Spectate } from "../interactions/Spectate"

/**
 * Class to manage the player's interactions
 */
@singleton()
@commandable()
@eventable()
@autoInjectable()
class InteractionManager implements INTERFACES.Manager {
  private teamSelector?: TeamSelector
  private spectate: Spectate

  constructor(
    readonly playerManager: PlayerManager,
    readonly dummyConfigManager: DummyConfigManager,
    readonly teamManager: TeamManager,
    readonly hudManager: HudManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.spectate                   = new Spectate({ playerManager, errHandler, hudManager })
    this.teamSelectorInteraction    = this.teamSelectorInteraction.bind(this)
    this.playerSpawn                = this.playerSpawn.bind(this)
    this.toggleTeamChoice           = this.toggleTeamChoice.bind(this)
    this.entityStreamIn             = this.entityStreamIn.bind(this)
    this.playerSpectate             = this.playerSpectate.bind(this)
  }

  /**
   * @inheritdoc
   */
  load(): void {
    mp.keys.bind(ENUMS.KEYCODES.VK_F4, false, this.toggleTeamChoice)
  }

  /**
   * Event
   * 
   * Fires from clientside when the all dummies are registered
   * 
   * Make an interaction of the team selector when player is just received dummies
   * or make task to change a team
   */
  @event(SHARED.EVENTS.CLIENT_DUMMIES_READY)
  teamSelectorInteraction(): void {
    try {
      if (!this.teamSelector) {

        const config = this.dummyConfigManager.dummy
        const teamSelector = config.data.TEAM_SELECTOR

        const teams = this.teamManager.getTeams(config.data.TEAMS)

        const [camVectorX, camVectorY, camVectorZ]       = teamSelector.CAM.VECTOR
        const [camPointX, camPointY, camPointZ]          = teamSelector.CAM.POINT_AT
        const [camRotationX, camRotationY, camRotationZ] = teamSelector.CAM.ROTATION
        const [pedVectorX, pedVectorY, pedVectorZ]       = teamSelector.PED.VECTOR

        this.teamSelector = new TeamSelector({
          camVector       : new mp.Vector3(camVectorX, camVectorY, camVectorZ),
          camPointAt      : new mp.Vector3(camPointX, camPointY, camPointZ),
          camRotation     : new mp.Vector3(camRotationX, camRotationY, camRotationZ),
          camFov          : teamSelector.CAM.FOV,

          pedVector       : new mp.Vector3(pedVectorX, pedVectorY, pedVectorZ),
          pedHeading      : teamSelector.PED.HEADING,

          teams,
          playerManager   : this.playerManager,
          errHandler      : this.errHandler,
          hudManager      : this.hudManager,
        })

        this.playerManager.setCustomData('isSelecting', true)
      }

      if (
        this.playerManager.getCustomData("isSelecting") === true
        && !this.teamSelector.active
      ) {
        this.teamSelector.start()
      }
    } catch (err) {
      if (this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when a player has just spawned in the lobby
   */
  @event(RageEnums.EventKey.PLAYER_SPAWN)
  playerSpawn(): void {
    if (this.playerManager.getCustomData("isSelecting") === true) {
      this.teamSelectorInteraction()
    }
  }

  /**
   * Event
   * 
   * Fires when an entity is in stream distance
   */
  @event(RageEnums.EventKey.ENTITY_STREAM_IN)
  entityStreamIn(entity: EntityMp): void {
    try {
      this.spectate.streamIn(entity)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Event
   * 
   * Fires when a player wants spectating
   * @param {number} id - optional
   */
  @event(SHARED.EVENTS.SERVER_PLAYER_SPECTATE)
  playerSpectate(id?: string | number) {
    try {
      this.toggleSpectate(id)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Also binded as a key VK_F4
   * 
   * Get an access to change a team after suicide
   */
  @command("change")
  toggleTeamChoice(): void {
    const toggle: boolean = !this.playerManager.getCustomData('isSelecting')

    this.playerManager.setCustomData("isSelecting", toggle)

    mp.gui.chat.push(toggle
      ? this.lang.get(SHARED.MSG.TEAM_SELECTOR_CHANGE)
      : this.lang.get(SHARED.MSG.TEAM_SELECTOR_CHANGE_CANCEL)
    )
  }

  /**
   * Command
   * 
   * Toggle a spectate for the players
   * 
   * @param {string} playerId - optional
   */
  toggleSpectate(playerIdOrName?: string | number): void {
    if (typeof playerIdOrName === 'undefined') {
      const toggle: boolean = this.playerManager.getCustomData('isSpectating')

      if (toggle) {
        this.spectate.enable()
      } else {
        this.spectate.disable()
      }
      this.playerManager.setCustomData('isSpectating', toggle)

      mp.gui.chat.push(toggle
        ? this.lang.get(SHARED.MSG.SPECTATING_ENABLE)
        : this.lang.get(SHARED.MSG.SPECTATING_DISABLE)
      )

      return
    }

    if (playerIdOrName === 'off') {
      return this.spectate.disable()
    }

    const player = this.playerManager.getPlayerByIdOrName(playerIdOrName.toString())
    if (mp.players.exists(player)) {
      if (!this.spectate.isEnabled()) {
        this.spectate.enable()
      }

      this.spectate.turn(player)
    }
  }

  /**
   * Get a spectate element
   */
  getSpectate(): Spectate {
    return this.spectate
  }
}

export { InteractionManager }