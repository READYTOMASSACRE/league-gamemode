import 'reflect-metadata'
import { print } from './utils'
import { app } from './bootstrap'

try {
  print.reset()
  app.start()
} catch (err) {
  print.error(err.stack)
}