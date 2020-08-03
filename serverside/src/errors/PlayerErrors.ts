export class PlayerNotifyError extends Error {
  public args: string[]
  constructor(message?: string, public readonly player?: PlayerMp | PlayerMp[], ...args: string[]) {
    super(message)

    this.args = args
  }
}

export class RoundIsNotRunningError extends PlayerNotifyError {}
export class RoundIsRunningError extends PlayerNotifyError {}
export class RoundIsPausedError extends PlayerNotifyError {}
export class RoundIsNotPausedError extends PlayerNotifyError {}

export class RoundStatGetError extends PlayerNotifyError {}
export class RoundStatUpdateError extends PlayerNotifyError {}

export class PlayerStatUpdateError extends PlayerNotifyError {}

export class VoteError extends PlayerNotifyError {}
export class VoteAddError extends PlayerNotifyError {}

export class NotFoundNotifyError extends PlayerNotifyError {}
export class InvalidArgumentNotify extends PlayerNotifyError {}
export class InvalidLoginGroup extends PlayerNotifyError {}
export class InvalidAccessNotify extends PlayerNotifyError {}