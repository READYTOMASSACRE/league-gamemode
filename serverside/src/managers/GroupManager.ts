import { singleton, autoInjectable } from "tsyringe"
import { Config } from "../core/Config"
import { command, commandable } from "rage-decorators"
import { PlayerManager } from "./PlayerManager"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { InvalidAccessNotify, InvalidArgumentNotify, InvalidLoginGroup } from "../errors/PlayerErrors"
import { hash256 } from "../utils"
import { PlayerProfileManager } from "./PlayerProfileManager"


const GROUP_CMD = 'g'
/**
 * Class to manage player groups
 */
@singleton()
@commandable()
@autoInjectable()
class GroupManager {
  private rcon: string

  constructor(
    config: Config,
    readonly playerManager: PlayerManager,
    readonly playerProfileManager: PlayerProfileManager,
    readonly lang: DummyLanguageManager,
    readonly errHandler: ErrorHandler,
  ) {
    this.rcon               = hash256(config.get('RCON'))
    this.rconCmd            = this.rconCmd.bind(this)
    this.loginCmd           = this.loginCmd.bind(this)
    this.addAdminCmd        = this.addAdminCmd.bind(this)
    this.addModeratorCmd    = this.addModeratorCmd.bind(this)
    this.addUserCmd         = this.addUserCmd.bind(this)
  }

  /**
   * Command
   * 
   * Login as root
   * @param {PlayerMp} player 
   * @param {string} cmdDesc 
   * @param {string} password - rcon password
   */
  @command('rcon', GROUP_CMD)
  rconCmd(player: PlayerMp, cmdDesc: string, password?: string): void {
    try {
      if (typeof password === 'undefined') {
        player.outputChatBox(cmdDesc)
        return
      }
      if (this.isRoot(player)) {
        this.sendLoginAlready(player, SHARED.GROUP.ROOT)
      } else if (this.rcon === hash256(password)) {
        const SUCCESS_LOGIN = true
        this.playerManager.setGroup(player, SHARED.GROUP.ROOT)
        this.sendLoginNotify(player, SUCCESS_LOGIN, SHARED.GROUP.ROOT)
      }
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Login as administrator/moderator
   * @param player 
   * @param cmdDesc 
   * @param password 
   */
  @command('login', GROUP_CMD)
  loginCmd(player: PlayerMp, cmdDesc: string, password?: string): void {
    try {
      if (typeof password === 'undefined') {
        player.outputChatBox(cmdDesc)
        return
      }

      const profile   = this.playerProfileManager.getDomain(player)
      const success   = profile.login(password)
      const group     = profile.getGroup()

      if (this.playerManager.getGroup(player) === group) {
        this.sendLoginAlready(player, group)
        return
      }

      if (success) this.playerManager.setGroup(player, group)

      this.sendLoginNotify(player, success, group)
      
    } catch (err) {
      if (err instanceof InvalidLoginGroup) {
        const lang = this.playerManager.getLang(player)
        const message = this.lang.get(lang, SHARED.MSG.GROUP_LOGIN_INVALID)

        this.playerManager.notify(player, message, 'error')
      } else if (!this.errHandler.handle(err)) {
        throw err
      }
    }
  }

  /**
   * Command
   * 
   * Set a moderator group to the player by player id
   * @param {PlayerMp} player 
   * @param {string} cmdDesc
   * @param {string} playerId - player id
   * @param {string} newPassword - a password to log into the group
   */
  @command(['addmod', 'addmoderator'], { group: GROUP_CMD, desc: '/{{groupName}} {{cmdName}} id password'})
  addModeratorCmd(player: PlayerMp, cmdDesc: string, playerId?: string, newPassword?: string): void {
    try {
      const lang = this.playerManager.getLang(player)
      // check if player has access
      if (!this.isAdminOrRoot(player)) {
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }
  
      // check if args are correct
      if (
        typeof playerId === 'undefined'
        || typeof newPassword === 'undefined'
        || !newPassword.length
      ) {
        throw new InvalidArgumentNotify(cmdDesc, player)
      }

      const addingPlayer = this.playerManager.getPlayerById(+playerId, player)

      // check if adding player has user or moderator group
      if (
        this.isAdmin(player)
        && this.isAdminOrRoot(addingPlayer)
      ) {
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_SIMILAR_GROUP)
        throw new InvalidAccessNotify(message, player)
      }
  
      // add a new group to the player
      this.addGroupToPlayer(addingPlayer, SHARED.GROUP.MODERATOR, newPassword)

      // notify player about successful result
      this.sendSuccessAdding(player, SHARED.GROUP.MODERATOR, addingPlayer)

      // notify the player who has been received the group
      this.sendPlayerGroupAdded(addingPlayer, SHARED.GROUP.MODERATOR, newPassword)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Set an admin group to the player by player id
   * @param {PlayerMp} player 
   * @param {string} cmdDesc
   * @param {string} playerId - player id
   * @param {string} newPassword - a password to log into the group
   */
  @command(['addadm', 'addadmin'], { group: GROUP_CMD, desc: '/{{groupName}} {{cmdName}} id password'})
  addAdminCmd(player: PlayerMp, cmdDesc: string, playerId?: string, newPassword?: string): void {
    try {
      // check if player has access
      if (!this.isRoot(player)) {
        const message = this.lang.get(player.sharedData.lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }
  
      // check if args are correct
      if (
        typeof playerId === 'undefined'
        || typeof newPassword === 'undefined'
        || !newPassword.length
      ) {
        throw new InvalidArgumentNotify(cmdDesc, player)
      }

      // add a new group to the player
      const addingPlayer = this.playerManager.getPlayerById(+playerId, player)
  
      // add a new group to the player
      this.addGroupToPlayer(addingPlayer, SHARED.GROUP.ADMIN, newPassword)

      // notify player about successful result
      this.sendSuccessAdding(player, SHARED.GROUP.ADMIN, addingPlayer)

      // notify the player who has been received the group
      this.sendPlayerGroupAdded(addingPlayer, SHARED.GROUP.ADMIN, newPassword)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  @command(['pwd', 'password'], { group: GROUP_CMD, desc: '/{{groupName}} {{cmdName}} password - Password without spaces' })
  changePasswordCmd(player: PlayerMp, cmdDesc: string, newPassword: string): void {
    try {
      const lang = this.playerManager.getLang(player)
        
      // check if player has access
      if (!this.isAdminOrModerator(player)) {
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }

      // check if args are correct
      if (
        typeof newPassword === 'undefined'
        || !newPassword.length
      ) {
        throw new InvalidArgumentNotify(cmdDesc, player)
      }

      const profile   = this.playerProfileManager.getDomain(player)

      profile.setPassword(newPassword)

      this.playerProfileManager.update(player, profile)
      this.playerProfileManager.save(player)

      this.sendChangePasswordNotify(player)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Set a user group to the player by player id
   * @param {PlayerMp} player 
   * @param {string} cmdDesc
   * @param {string} playerId - player id
   * @param {string} newPassword - a password to log into the group
   */
  @command('user', { group: GROUP_CMD, desc: '/{{groupName}} {{cmdName}} id password'})
  addUserCmd(player: PlayerMp, cmdDesc: string, playerId?: string): void {
    try {
      const lang = this.playerManager.getLang(player)
      
      // check if player has access
      if (!this.isAdminOrRoot(player)) {
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_WRONG_ACCESS)
        throw new InvalidAccessNotify(message, player)
      }

      // check if args are correct
      if (typeof playerId === 'undefined') {
        throw new InvalidArgumentNotify(cmdDesc, player)
      }

      const addingPlayer = this.playerManager.getPlayerById(+playerId, player)
      // check if adding player has user or moderator group
      if (!this.isRoot(player) && this.isAdminOrRoot(addingPlayer)) {
        const message = this.lang.get(lang, SHARED.MSG.GROUP_ERR_SIMILAR_GROUP)
        throw new InvalidAccessNotify(message, player)
      }

      // add the user group to a player
      this.addGroupToPlayer(addingPlayer, SHARED.GROUP.USER)

      // notify player about successful result
      this.sendSuccessAdding(player, SHARED.GROUP.USER, addingPlayer)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }
  
  /**
   * Add a group to the player
   * @param {SHARED.GROUP} group - group id
   * @param {PlayerMp} addingPlayer  - player who will be added to the group
   * @param {string} password - password to log into the group
   * @param {PlayerMp} player (optional) - to notify a player about the result
   */
  addGroupToPlayer(addingPlayer: PlayerMp, group: SHARED.GROUP, password?: string): boolean {
    // set the player group
    this.playerManager.setGroup(addingPlayer, group)
    if (group !== SHARED.GROUP.ROOT) {
      const profile = this.playerProfileManager.getDomain(addingPlayer)

      profile.setGroup(group)
      if (password) profile.setPassword(password)

      this.playerProfileManager.update(addingPlayer, profile)
      this.playerProfileManager.save(addingPlayer)
    }

    return true
  }

  /**
   * Check if a player is a root
   * @param {PlayerMp} player 
   */
  isRoot(player: PlayerMp): boolean {
    return this.playerManager.getGroup(player) === SHARED.GROUP.ROOT
  }

  /**
   * Check if a player is an admin
   * @param {PlayerMp} player 
   */
  isAdmin(player: PlayerMp): boolean {
    return this.playerManager.getGroup(player) === SHARED.GROUP.ADMIN
  }

  /**
   * Check if a player is root or admin
   * @param {PlayerMp} player
   */
  isAdminOrRoot(player: PlayerMp): boolean {
    return this.isAdmin(player) || this.isRoot(player)
  }

  /**
   * Check if a player is moderator or admin
   * @param {PlayerMp} player
   */
  isAdminOrModerator(player: PlayerMp): boolean {
    return this.isAdmin(player) || this.isModerator(player)
  }

  /**
   * Check if a player is moderator or admin
   * @param {PlayerMp} player
   */
  isUser(player: PlayerMp): boolean {
    return this.playerManager.getGroup(player) === SHARED.GROUP.USER
  }

  /**
   * Check if the player is a moderator
   * @param {PlayerMp} player 
   */
  isModerator(player: PlayerMp): boolean {
    return this.playerManager.getGroup(player) === SHARED.GROUP.MODERATOR
  }

  /**
   * Get a group name by id
   * @param {SHARED.GROUP} id - group id
   * @param {string} lang (optional) - lang id
   */
  getGroupName(id: SHARED.GROUP, lang: string = 'en'): string {
    return this.lang.get(lang, this.groupDictionary[id])
  }

  /**
   * Check if a player has upper group then another player
   * @param {PlayerMp} player 
   * @param {PlayerMp} thanPlayer 
   */
  hasUpperGroupThan(player: PlayerMp, thanPlayer: PlayerMp): boolean {
    const playerGroup = this.playerManager.getGroup(player)
    const similarGroup = this.playerManager.getGroup(thanPlayer)

    return playerGroup > similarGroup
  }

  /**
   * Check if a player has same group with another player
   * @param {PlayerMp} player 
   * @param {PlayerMp} thanPlayer 
   */
  hasSameGroupWith(player: PlayerMp, thanPlayer: PlayerMp): boolean {
    const playerGroup = this.playerManager.getGroup(player)
    const similarGroup = this.playerManager.getGroup(thanPlayer)

    return playerGroup === similarGroup
  }

  /**
   * Check if a player has same or upper group with another player
   * @param {PlayerMp} player 
   * @param {PlayerMp} thanPlayer 
   */
  hasUpperOrSameGroupWith(player: PlayerMp, thanPlayer: PlayerMp): boolean {
    return this.hasUpperGroupThan(player, thanPlayer) || this.hasSameGroupWith(player, thanPlayer)
  }
  
  /**
   * Notify a player who has added a new group to addedPlayer
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - group id
   * @param {PlayerMp} addedPlayer - (optional) the player who was added to the group
   */
  private sendSuccessAdding(player: PlayerMp, group: SHARED.GROUP, addedPlayer: PlayerMp): void {
    const lang    = this.playerManager.getLang(player)
    const message = this.lang.get(lang, SHARED.MSG.GROUP_ADD_SUCCESS, this.getGroupName(group, lang), addedPlayer.name)

    this.playerManager.notify(player, message, 'success')
  }

  /**
   * Notify a player who has been added to the group
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - group id
   * @param {PlayerMp} addedPlayer - (optional) the player who was added to the group
   */
  private sendPlayerGroupAdded(player: PlayerMp, group: SHARED.GROUP, password: string): void {
    const lang    = this.playerManager.getLang(player)
    const message = this.lang.get(lang, SHARED.MSG.GROUP_ADD_SUCCESS_SELF, this.getGroupName(group, lang), password)

    this.playerManager.notify(player, message, 'success')
  }

  /**
   * Notify a player success logging
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - group id
   */
  private sendLoginNotify(player: PlayerMp, success: boolean, group: SHARED.GROUP): void {
    const lang    = this.playerManager.getLang(player)
    const msgType = success ? SHARED.MSG.GROUP_LOGIN_SUCCESS : SHARED.MSG.GROUP_LOGIN_FAILURE
    const message = this.lang.get(lang, msgType, this.getGroupName(group, lang))

    this.playerManager.notify(player, message, success ? 'success' : 'error')
  }

  /**
   * Notify a player success logging
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - group id
   */
  private sendLoginAlready(player: PlayerMp, group: SHARED.GROUP): void {
    const lang    = this.playerManager.getLang(player)
    const message = this.lang.get(lang, SHARED.MSG.GROUP_LOGGED_ALREADY, this.getGroupName(group, lang))

    this.playerManager.notify(player, message, 'info')
  }

  /**
   * Notify a player success logging
   * @param {PlayerMp} player 
   * @param {SHARED.GROUP} group - group id
   */
  private sendChangePasswordNotify(player: PlayerMp): void {
    const lang    = this.playerManager.getLang(player)
    const message = this.lang.get(lang, SHARED.MSG.GROUP_PASSWORD_CHANGED)

    this.playerManager.notify(player, message, 'success')
  }

  /**
   * Group names dictionary
   */
  get groupDictionary(): { [key in SHARED.GROUP]: SHARED.MSG } {
    return {
      [SHARED.GROUP.ROOT]         : SHARED.MSG.GROUP_ROOT,
      [SHARED.GROUP.ADMIN]        : SHARED.MSG.GROUP_ADMIN,
      [SHARED.GROUP.MODERATOR]    : SHARED.MSG.GROUP_MODERATOR,
      [SHARED.GROUP.USER]         : SHARED.MSG.GROUP_USER,
    }
  }
}

export { GroupManager }