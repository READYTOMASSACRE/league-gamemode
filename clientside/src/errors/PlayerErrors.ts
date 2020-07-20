export class PlayerNotifyError extends Error {
  public readonly args: string[]
  constructor(message?: string, ...args: string[]) {
    super(message)

    this.args = args
  }
}

export class NotFoundNotifyError extends PlayerNotifyError {}