import { singleton, autoInjectable } from "tsyringe"
import { command, commandable, registeredCommands } from "rage-decorators"

/**
 * Manage all cmds in the serverside
 */
@singleton()
@commandable()
class CommandManager {
  static readonly PER_PAGE = 9

  private _list: string[] = []
  private _maxPages: number = 0

  constructor() {
    this.cmdlist = this.cmdlist.bind(this)
  }

  /**
   * Getting all cmds from the server and print to the player
   * @param {PlayerMp} player 
   * @param {string} commandDescription - the command description
   * @param {string} pagination (optional) - number of the page
   */
  @command("cmdlist")
  cmdlist(player: PlayerMp, commandDescription: string, pagination: string = "1"): void {
    const page = (+pagination || 1) > this.maxPages && this.maxPages || (+pagination || 1)

    const startIndex = (page - 1) * CommandManager.PER_PAGE
      , endIndex = page * CommandManager.PER_PAGE

    const cmds = this.list.slice(startIndex, endIndex)

    cmds.forEach((text, index) => player.outputChatBox(`[${startIndex+index+1}]: ` + text))

    player.outputChatBox(
      [
        SHARED.MSG.PAGE_SHOW_CMD,
        page,
        startIndex+1,
        startIndex+cmds.length,
        this.list.length
      ].join(',')
    )
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