import { Application } from './core'
import { container } from 'tsyringe'
import { ErrorHandler } from './core/ErrorHandler'

/** @todo take then result from config */
export const DEBUG = true

// resolve the errHandler
export const errorHandler: ErrorHandler = container.resolve(ErrorHandler)

// make an app
export const app: Application = new Application()