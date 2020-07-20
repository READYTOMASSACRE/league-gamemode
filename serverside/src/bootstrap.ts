import { resolve } from 'path'
import { getProjectDir, getJsonFromFileSync } from './utils/index'
import { container } from 'tsyringe'

// first init the debug param
const params: any = getJsonFromFileSync(resolve(getProjectDir(), "assets", "config.json"))
export const DEBUG: boolean = params.DEBUG

// then makes all overrides
import './declarations/override'

import { Config } from './core/Config'
import { Application } from './core/Application'
import { ErrorHandler } from './core/ErrorHandler'

// resolve errHandler to handle static errors
export const errorHandler: ErrorHandler = container.resolve(ErrorHandler)
// resolve Config
export const config: any = new Config(params)
container.register(Config, { useValue: config })

// resolve the App
export const app: Application = container.resolve(Application)
container.register("app", { useValue: app })