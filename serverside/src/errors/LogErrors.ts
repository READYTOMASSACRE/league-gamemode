export class LogError extends Error {
  constructor(message?: string, public readonly colorFunc?: Function) {
    super(message)
  }
}

export class ConsoleError extends LogError {}
export class ServerError extends ConsoleError {}
export class NullError extends ConsoleError {}
export class IsNotExistsError extends ConsoleError {}
export class InvalidTypeError extends ConsoleError {}