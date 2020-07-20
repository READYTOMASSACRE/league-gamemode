import { Application } from './core'
import { Language } from './core/Language'
import { container } from 'tsyringe'
import { ErrorHandler } from './core/ErrorHandler'

/** @todo take then result from config */
export const DEBUG = true

// resolve the language
export const language: Language = container.resolve(Language)
// resolve the errHandler
export const errorHandler: ErrorHandler = container.resolve(ErrorHandler)

// make an app
export const app: Application = new Application()