import { Hud } from "./Hud"
import { hex2rgba } from "../utils"
import { Scaleform } from "../entities/Scaleform"

/**
 * Hud element - Team selecting
 */
class TeamSelecting extends Hud {
  private teamName        : string = 'unknown'
  private color           : RGBA = [255, 255, 255, 255]
  private buttons?        : Scaleform

  /**
   * @inheritdoc
   */
  protected async prepare(): Promise<void> {
    try {
      this.buttons = new Scaleform("INSTRUCTIONAL_BUTTONS")

      this.buttons.callFunction("CLEAR_ALL")
      this.buttons.callFunction("TOGGLE_MOUSE_BUTTONS", 0)
      this.buttons.callFunction("SET_CLEAR_SPACE", 100)

      const changeTeam    = this.lang.get(SHARED.MSG.TEAM_SELECTOR_CHANGE_TEAM)
      const changeSkin    = this.lang.get(SHARED.MSG.TEAM_SELECTOR_CHANGE_SKIN)
      const submit        = this.lang.get(SHARED.MSG.TEAM_SELECTOR_SUBMIT)

      const vk_w_s        = mp.game.controls.getControlActionName(2, RageEnums.Controls.FLY_UP_DOWN, true),
        vk_a_d            = mp.game.controls.getControlActionName(2, RageEnums.Controls.FLY_LEFT_RIGHT, true),
        vk_submit         = mp.game.controls.getControlActionName(2, RageEnums.Controls.FRONTEND_RDOWN, true)
        
      // we should wait before scaleforms will be initialized
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      
      this.buttons.callFunction('SET_DATA_SLOT', 0, vk_submit, submit)
      this.buttons.callFunction('SET_DATA_SLOT', 1, vk_w_s, changeSkin)
      this.buttons.callFunction('SET_DATA_SLOT', 2, vk_a_d, changeTeam)

      this.buttons.callFunction("DRAW_INSTRUCTIONAL_BUTTONS", -1)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
  /**
   * @inheritdoc
   */
  start(): void {
    mp.events.add(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * @inheritdoc
   */
  stop(): void {
    mp.events.remove(RageEnums.EventKey.RENDER, this.render)
  }

  /**
   * Change a team data for the render method
   * @param {SHARED.TEAMS} teamId
   */
  setTeamData(teamId: SHARED.TEAMS): void {
    const team    = this.dummyConfig.getTeam(teamId)
    this.teamName = team.NAME
    this.color    = hex2rgba(team.COLOR)
  }

  /**
   * @inheritdoc
   */
  render(): void {
    try {
      mp.game.graphics.drawText(this.teamName, [0.5, 0.65], {...this.textParams, color: this.color })
      if (this.buttons) this.buttons.render2DFullScreen()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
}

export { TeamSelecting }