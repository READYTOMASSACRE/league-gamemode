import { register } from "rage-rpc"
import { RPC } from "../events"
import { MSG } from "../messages"

/**
 * Language class
 */
export class Language {
  private messages: Map<string, string> = new Map()

  constructor(language?: any) {
    this.load = this.load.bind(this)
    register(RPC.CLIENT_LANGUAGE, this.load)

    if (language) this.load(language)
  }

  /**
   * Set up app language
   * 
   */
  load(data: any[]): void {
    try {
      const [ messages ] = data
      this.messages = new Map()
  
      Object
        .entries(messages)
        .forEach(([id, msg]) => this.messages.set(id, msg as string))
    } catch (err) {
      throw new Error(this.get(MSG.ERR_LANG_NOT_FOUND))
    }
  }

  /**
   * Get message by id
   * 
   * @param id - message id
   * @param args - (optional) arguments to format message
   */
  get(id: string, ...args: string[]): string {
    const message = this.messages.get(id)

    if (!message) return id

    return args.length
      ? this.format(message, ...args)
      : message
  }

  private format(message: string, ...args: string[]): string {
    if (args.length) {
      args.forEach(argument => {
        message = message.replace('%s', argument)
      })
    }

    return message
  }
}

export const lang: Language = new Language()