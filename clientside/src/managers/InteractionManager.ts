import { TeamSelector } from "../interactions/TeamSelector"
import { PlayerManager } from "./PlayerManager"
import { print } from "../utils"
import { TeamManager } from "./TeamManager"
import { singleton, autoInjectable } from "tsyringe"
import { DummyConfigManager } from "./dummies/DummyConfigManager"
import { command, commandable, eventable, event } from "rage-decorators"
import { Language } from "../core/Language"
import { ErrorHandler } from "../core/ErrorHandler"

/**
 * Class to manage the player's interactions
 */
@singleton()
@autoInjectable()
@commandable()
@eventable()
class InteractionManager implements INTERFACES.Manager {
  private teamSelector?: TeamSelector
  constructor(
    readonly playerManager: PlayerManager,
    readonly dummyConfigManager: DummyConfigManager,
    readonly teamManager: TeamManager,
    readonly lang: Language,
    readonly errHandler: ErrorHandler,
  ) {
    this.teamSelectorInteraction = this.teamSelectorInteraction.bind(this)
    this.playerSpawn = this.playerSpawn.bind(this)
    this.toggleTeamChoice = this.toggleTeamChoice.bind(this)
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
        })

        this.playerManager.setCustomData('isSelecting', true)
      }

      if (this.playerManager.getCustomData("isSelecting") === true) {
        this.teamSelector.start()
      }
    } catch (err) {
      print.error(err.stack)
    }
  }

  /**
   * Event
   * 
   * Fires when the player has spawned
   */
  @event(RageEnums.EventKey.PLAYER_SPAWN)
  playerSpawn(): void {
    if (this.playerManager.getCustomData("isSelecting") === true) this.teamSelectorInteraction()
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
}

export { InteractionManager }