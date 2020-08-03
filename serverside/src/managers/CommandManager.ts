import { singleton, autoInjectable } from "tsyringe"
import { command, commandable, registeredCommands } from "rage-decorators"
import { DummyLanguageManager } from "./dummies/DummyLanguageManager"
import { PlayerManager } from "./PlayerManager"
import { ErrorHandler } from "../core/ErrorHandler"
import { GroupManager } from "./GroupManager"
import { InvalidAccessNotify, InvalidArgumentNotify } from "../errors/PlayerErrors"
import { cmdName } from "../utils"

/**
 * Manage all cmds in the serverside
 */
@singleton()
@commandable()
@autoInjectable()
class CommandManager {
  static readonly PER_PAGE = 9

  private _list: string[] = []
  private _maxPages: number = 0

  constructor(
    readonly playerManager    : PlayerManager,
    readonly groupManager     : GroupManager,
    readonly lang             : DummyLanguageManager,
    readonly errHandler       : ErrorHandler,
  ) {
    this.cmdlist    = this.cmdlist.bind(this)
    this.kick       = this.kick.bind(this)
    this.mute       = this.mute.bind(this)
    this.unmute     = this.unmute.bind(this)
  }

  /**
   * Command
   * 
   * Getting all cmds from the server and print to the player
   * @param {PlayerMp} player 
   * @param {string} commandDescription - the command description
   * @param {string} pagination (optional) - number of the page
   */
  @command("cmdlist")
  cmdlist(player: PlayerMp, commandDescription: string, pagination: string = "1"): void {
    try {
      const page = (+pagination || 1) > this.maxPages && this.maxPages || (+pagination || 1)
  
      const startIndex = (page - 1) * CommandManager.PER_PAGE
        , endIndex = page * CommandManager.PER_PAGE
  
      const cmds = this.list.slice(startIndex, endIndex)
  
      cmds.forEach((text, index) => player.outputChatBox(`[${startIndex+index+1}]: ` + text))
  
      const lang = this.playerManager.getLang(player)
      const message = this.lang.get(
        lang,
        SHARED.MSG.PAGE_SHOW_CMD,
        page,
        startIndex+1,
        startIndex+cmds.length,
        this.list.length
      )
  
      player.outputChatBox(message)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Kicking player by id with reason
   * @param {PlayerMp} player 
   * @param {string} cmdDesc - the command description
   * @param {string} playerIdOrName player id or name
   * @param {string} reason (optional) reason of kick
   */
  @command('kick', { desc: cmdName })
  kick(player: PlayerMp, cmdDesc: string, playerIdOrName?: string, ...reason: string[]): void {
    try {
      const lang = this.playerManager.getLang(player)
      if (this.groupManager.isUser(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }
  
      if (typeof playerIdOrName === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_KICK)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
      }
  
      const kickedPlayer: PlayerMp = this.playerManager.getPlayerByIdOrName(playerIdOrName, player)

      if (!this.groupManager.hasUpperGroupThan(player, kickedPlayer)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      const kickReason = reason.length && reason.join(' ') || ""

      mp.players.forEach(player => {
        const localeReason = kickReason.length && kickReason || this.lang.get(lang, SHARED.MSG.REASON_NULL)
        this.playerManager.info(player, SHARED.MSG.PLAYER_KICKED, kickedPlayer.name, player.name, localeReason)
      })

      kickedPlayer.kick(kickReason)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Mute player by id with reason
   * @param {PlayerMp} player 
   * @param {string} cmdDesc - the command description
   * @param {string} playerIdOrName player id or name
   * @param {string} minutes (optional) time to mute
   * @param {string} reason (optional) reason of muted
   */
  @command('mute', { desc: cmdName })
  mute(player: PlayerMp, cmdDesc: string, playerIdOrName?: string, minutes?: string, ...reason: string[]): void {
    try {
      if (this.groupManager.isUser(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }
  
      if (typeof playerIdOrName === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_MUTE)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
      }

      const mutedPlayer = this.playerManager.getPlayerByIdOrName(playerIdOrName, player)

      if (!this.groupManager.hasUpperOrSameGroupWith(player, mutedPlayer)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      const mutedReason = reason.length && reason.join(' ') || ""
      const mutedTime   = minutes || 1

      mp.players.forEach(player => {
        const lang            = this.playerManager.getLang(player)
        const localeReason    = mutedReason.length && mutedReason || this.lang.get(lang, SHARED.MSG.REASON_NULL)
        const message         = this.lang.get(lang, SHARED.MSG.PLAYER_MUTED, mutedPlayer.name, player.name, localeReason, mutedTime)
        player.outputChatBox(message)
      })

      this.playerManager.mute(mutedPlayer, +mutedTime)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Unmute player by id with reason
   * @param {PlayerMp} player 
   * @param {string} cmdDesc - the command description
   * @param {string} playerIdOrName player id or name
   */
  @command('unmute', { desc: cmdName })
  unmute(player: PlayerMp, cmdDesc: string, playerIdOrName?: string): void {
    try {
      if (this.groupManager.isUser(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }
  
      if (typeof playerIdOrName === 'undefined') {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_UNMUTE)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
      }

      const mutedPlayer = this.playerManager.getPlayerByIdOrName(playerIdOrName, player)

      if (!this.groupManager.hasUpperOrSameGroupWith(player, mutedPlayer)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      mp.players.forEach(player => {
        const lang            = this.playerManager.getLang(player)
        const message         = this.lang.get(lang, SHARED.MSG.PLAYER_UNMUTED, mutedPlayer.name, player.name)
        player.outputChatBox(message)
      })

      this.playerManager.unmute(mutedPlayer)
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Command
   * 
   * Change team to a player
   * @param {PlayerMp} player
   * @param {string} cmdDesc
   * @param {string} idOrName - id or nickname an adding player
   */
  @command(['changeteam', 'ct'], { desc: cmdName })
  changeTeamCmd(player: PlayerMp, cmdDesc: string, idOrName?: string, teamId?: 'att' | 'def' | 'spec'): void {
    try {
      if (!this.groupManager.isAdminOrRoot(player)) {
        throw new InvalidAccessNotify(SHARED.MSG.GROUP_ERR_WRONG_ACCESS, player)
      }

      if (
        typeof idOrName === 'undefined'
        || typeof teamId === 'undefined'
        || ['att', 'def', 'spec'].indexOf(teamId) === -1
      ) {
        const lang = this.playerManager.getLang(player)
        const cmdDescText = this.lang
          .get(lang, SHARED.MSG.CMD_CHANGE_TEAM)
          .replace(cmdName, cmdDesc)

        return this.playerManager.notify(player, cmdDescText)
      }

      const findedPlayer = this.playerManager.getPlayerByIdOrName(idOrName, player)

      if (!this.playerManager.hasState(findedPlayer, SHARED.STATE.IDLE)) {
        throw new InvalidArgumentNotify(SHARED.MSG.ERR_PLAYER_IN_ROUND, player, findedPlayer.name)
      }

      let team = SHARED.TEAMS.ATTACKERS
      if (teamId === 'def') team = SHARED.TEAMS.DEFENDERS
      if (teamId === 'spec') team = SHARED.TEAMS.SPECTATORS

      this.playerManager.setPlayerTeam(findedPlayer, team)
      const { NAME, COLOR } = this.playerManager.dummyConfig.getTeamData(team)

      mp.players.forEach(ppl => {
        this.playerManager.success(ppl, SHARED.MSG.PLAYER_CHANGED_TEAM, findedPlayer.name, `!{${COLOR}}${NAME}`)
      })
    } catch (err) {
      if (!this.errHandler.handle(err)) throw err
    }
  }

  /**
   * Make a list of the commands
   */
  private makeList(): void {
    let texts: string[] = []

    registeredCommands.forEach((value, mainCmd) => {
      if (Array.isArray(value)) {
        let hasDescription = false
        const cmds = value.reduce((carry, { cmd, desc }) => {
          if (!hasDescription && desc) hasDescription = true
          return carry.concat(desc || cmd)
        }, [] as string[])

        texts = [...texts, ...(hasDescription && cmds || cmds.map(cmdName => `/${mainCmd} ${cmdName}`))]
      } else {
        const { cmd, desc } = value

        texts = [...texts, ...(desc || cmd.map(cmdName => `/${cmdName}`))]
      }
    })

    this._list = texts
  }

  get list(): string[] {
    if (!this._list.length) this.makeList()
    return this._list
  }

  get maxPages(): number {
    if (!this._maxPages) this._maxPages = Math.ceil(this.list.length / CommandManager.PER_PAGE)
    return this._maxPages
  }
}

export { CommandManager }