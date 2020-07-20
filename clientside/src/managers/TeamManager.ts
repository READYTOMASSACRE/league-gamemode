import { singleton, injectable } from "tsyringe"
import { DummyConfigManager } from "./dummies/DummyConfigManager"

/**
 * Class to manage the teams
 * @todo guess may this class worth delete, need to revise
 */
@injectable()
@singleton()
class TeamManager {
  constructor(readonly dummyConfigManager: DummyConfigManager) {}

  /**
   * Normalize data
   * @param dummyTeams 
   */
  getTeams(dummyTeams?: SHARED.TYPES.Teams): TYPES.PlayerTeam[] {
    if (!dummyTeams) dummyTeams = this.getDummyTeams()

    const teams: TYPES.PlayerTeam[] = [
      {
        ID: SHARED.TEAMS.ATTACKERS,
        NAME: dummyTeams.ATTACKERS.NAME,
        SKINS: dummyTeams.ATTACKERS.SKINS,
        COLOR: dummyTeams.ATTACKERS.COLOR,
      },
      {
        ID: SHARED.TEAMS.DEFENDERS,
        NAME: dummyTeams.DEFENDERS.NAME,
        SKINS: dummyTeams.DEFENDERS.SKINS,
        COLOR: dummyTeams.DEFENDERS.COLOR,
      },
      {
        ID: SHARED.TEAMS.SPECTATORS,
        NAME: dummyTeams.SPECTATORS.NAME,
        SKINS: dummyTeams.SPECTATORS.SKINS,
        COLOR: dummyTeams.SPECTATORS.COLOR,
      }
    ]

    return teams
  }

  private getDummyTeams(): SHARED.TYPES.Teams {
    return this.dummyConfigManager.dummy.data.TEAMS
  }
}

export { TeamManager }