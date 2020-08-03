import { keyBind, keyUnbind } from "../utils/functions"
import { PlayerManager, HudManager } from "../managers"
import { ErrorHandler } from "../core/ErrorHandler"

type PlayerTeam = TYPES.PlayerTeam & { PEDS: PedMp[] }

type TeamSelectorParams = {
  camVector: Vector3Mp
  camFov: number
  camRotation?: Vector3Mp
  camPointAt: Vector3Mp

  pedVector: Vector3Mp
  pedHeading: number
  pedDimension?: number

  teams: TYPES.PlayerTeam[]
  playerManager: PlayerManager
  errHandler: ErrorHandler
  hudManager: HudManager
}

/**
 * Interaction of team choice
 * This gives to player opportunity to choice a skin and team
 */
class TeamSelector implements INTERFACES.Interaction {
  static readonly CAMERA_NAME = "TEAM_SELECTOR"

  public active               : boolean = false
  private teams               : PlayerTeam[]
  private playerManager       : PlayerManager
  private errHandler          : ErrorHandler
  private hudManager          : HudManager
  private cam                 : CameraMp

  private currentTeamIndex    : number
  private currentPedIndex     : number
  
  private player              : PlayerMp = mp.players.local

  private pedVector           : Vector3Mp
  private pedHeading          : number
  private pedDimension        : number = 0
  private pedIds              : number[] = []

  constructor(params: TeamSelectorParams) {
    this.cam           = this.createCam(params)
    this.playerManager = params.playerManager
    this.errHandler    = params.errHandler
    this.pedVector     = params.pedVector
    this.pedHeading    = params.pedHeading
    this.pedDimension  = params.pedDimension || this.pedDimension
    this.hudManager    = params.hudManager

    this.teams         = params.teams.map(({ ID, NAME, SKINS, COLOR }) => ({
      ID,
      NAME,
      SKINS,
      COLOR,
      PEDS: this.createPeds(SKINS)
    }))
    
    this.currentTeamIndex   = 0
    this.currentPedIndex    = 0

    this.submit             = this.submit.bind(this)
    this.turnRight          = this.turnRight.bind(this)
    this.turnLeft           = this.turnLeft.bind(this)
    this.turnUp             = this.turnUp.bind(this)
    this.turnDown           = this.turnDown.bind(this)
    this.streamIn           = this.streamIn.bind(this)
  }

  /**
   * Start team selector
   */
  start(): void {
    mp.events.add(RageEnums.EventKey.ENTITY_STREAM_IN, this.streamIn)
    this.playerManager.setState(SHARED.STATE.SELECT)

    this.currentTeamIndex = 0
    this.currentPedIndex = 0

    this.preparePlayer(true)
    this.prepareCam(true)
    this.refreshPeds(true)
    this.bindKeys()

    this.hudManager.teamSelecting.setTeamData(this.currentTeam.ID)
    this.hudManager.teamSelecting.start()

    this.active = true
  }

  /**
   * Stop team selector
   */
  stop(): void {
    this.unbindKeys()
    this.preparePlayer(false)
    this.prepareCam(false)
    this.refreshPeds(false)
    this.hudManager.teamSelecting.stop()

    mp.events.remove(RageEnums.EventKey.ENTITY_STREAM_IN, this.streamIn)
    this.playerManager.setCustomData("isSelecting", false)
    this.active = false
  }

  /**
   * Makes a camera in team selector
   * 
   * @param {TeamSelectorParams} params team selector params
   */
  private createCam({ camVector, camRotation, camFov, camPointAt: {x, y, z} }: TeamSelectorParams): CameraMp {
    const cam = mp.cameras.new(
      TeamSelector.CAMERA_NAME,
      camVector,
      camRotation,
      camFov
    )

    cam.pointAtCoord(x, y, z)

    return cam
  }

  /**
   * Create peds by skins array
   * 
   * @param skins skins of current team
   */
  private createPeds(skins: string[]): PedMp[] {
    return skins.map(skin => {
      const ped = mp.peds.new(
        mp.game.joaat(skin),
        this.pedVector,
        this.pedHeading,
        this.pedDimension
      )

      this.pedIds.push(ped.id)

      return ped
    })
  }

  /**
   * Preparing player to make a choice
   * doing them invincible, freeze, alpha and change a position
   * 
   * @param {boolean} isStart flag if team selector is started or stopped
   */
  private preparePlayer(isStart: boolean): void {
    this.player.setInvincible(isStart ? true : false)
    this.player.freezePosition(isStart ? true : false)
    this.player.setAlpha(isStart ? 0 : 255)

    if (isStart) {
      const vector = this.cam.getCoord()
      this.player.setCoordsNoOffset(vector.x, vector.y, vector.z, false, false, false)
    }
  }

  /**
   * Prepare game camera in the team selector
   * 
   * @param {boolean} isStart flag if team selector is started or stopped
   */
  private prepareCam(isStart: boolean): void {
    this.cam.setActive(isStart)
    mp.game.cam.renderScriptCams(isStart, false, 0, true, false)
  }

  /**
   * Refresh state of peds when player is pressing buttons
   * 
   * @param {boolean} isStart flag if team selector is started or stopped
   */
  private refreshPeds(isStart: boolean): void {
    this.teams.forEach(team => {
      team.PEDS.forEach(ped => {
        const isCurrentPed = ped.id === this.currentPed.id && isStart
        ped.setAlpha(isCurrentPed ? 255 : 0, false)
        ped.setInvincible(isCurrentPed ? false : true)
      })
    })
  }

  /**
   * Make turn left
   */
  private turnLeft(): void {
    this.currentTeamIndex = typeof this.teams[this.currentTeamIndex - 1] !== 'undefined'
      ? this.currentTeamIndex - 1
      : this.teams.length - 1
    this.refreshPeds(true)

    this.hudManager.teamSelecting.setTeamData(this.currentTeam.ID)
  }

  /**
   * Make turn right
   */
  private turnRight(): void {
    this.currentTeamIndex = typeof this.teams[this.currentTeamIndex + 1] !== 'undefined'
      ? this.currentTeamIndex + 1
      : 0
    this.refreshPeds(true)

    this.hudManager.teamSelecting.setTeamData(this.currentTeam.ID)
  }

  /**
   * Make turn down (change skin per team)
   */
  private turnDown(): void {
    this.currentPedIndex =  typeof this.currentTeam.PEDS[this.currentPedIndex - 1] !== 'undefined'
      ? this.currentPedIndex - 1
      : this.currentTeam.PEDS.length - 1
    this.refreshPeds(true)
  }

  /**
   * Make turn up (change skin per team)
   */
  private turnUp(): void {
    this.currentPedIndex =  typeof this.currentTeam.PEDS[this.currentPedIndex + 1] !== 'undefined'
      ? this.currentPedIndex + 1
      : 0
    this.refreshPeds(true)
  }

  /**
   * Submit decision and after send data and spawn the player into the lobby
   */
   submit(): void {
     try {
      this.stop()
  
      this.playerManager.setTeam(this.currentTeam.ID)
      this.playerManager.setModel(this.currentPed.model)
      this.playerManager.setState(SHARED.STATE.IDLE)
      this.playerManager.spawnInLobby()
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * bind keys to manage team selector
   */
  private bindKeys(): void {
    keyBind([ENUMS.KEYCODES.D, ENUMS.KEYCODES.VK_RIGHT], false, this.turnRight)
    keyBind([ENUMS.KEYCODES.A, ENUMS.KEYCODES.VK_LEFT], false, this.turnLeft)
    keyBind([ENUMS.KEYCODES.W, ENUMS.KEYCODES.VK_UP], false, this.turnUp)
    keyBind([ENUMS.KEYCODES.S, ENUMS.KEYCODES.VK_DOWN], false, this.turnDown)
    keyBind([ENUMS.KEYCODES.VK_RETURN], true, this.submit)
  }

  /**
   * unbind keys to manage team selector
   */
  private unbindKeys(): void {
    keyUnbind([ENUMS.KEYCODES.D, ENUMS.KEYCODES.VK_RIGHT], false, this.turnRight)
    keyUnbind([ENUMS.KEYCODES.A, ENUMS.KEYCODES.VK_LEFT], false, this.turnLeft)
    keyUnbind([ENUMS.KEYCODES.W, ENUMS.KEYCODES.VK_UP], false, this.turnUp)
    keyUnbind([ENUMS.KEYCODES.S, ENUMS.KEYCODES.VK_DOWN], false, this.turnDown)
    keyUnbind([ENUMS.KEYCODES.VK_RETURN], true, this.submit)
  }

  /**
   * Makes the peds are invincible for the player
   * 
   * @param {EntityMp} entity streamed entity
   */
  private streamIn(entity: EntityMp): void {
    if (
      entity.type === 'ped'
      && this.pedIds.indexOf(entity.id) !== -1
      && entity.id !== this.currentPed.id
    ) {
      entity.setAlpha(0, false)
    }
  }

  get currentTeam(): PlayerTeam {
    return this.teams[this.currentTeamIndex]
  }

  get currentPed(): PedMp {
    return typeof this.currentTeam.PEDS[this.currentPedIndex] !== 'undefined'
      ? this.currentTeam.PEDS[this.currentPedIndex]
      : this.currentTeam.PEDS[0]
  }
}

export { TeamSelector }