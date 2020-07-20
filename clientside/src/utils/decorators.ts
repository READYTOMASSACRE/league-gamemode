import 'reflect-metadata'

import { inspect } from 'util'
import { print } from './print'

export function logMethod(debug?: boolean) {
  return function (
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor): PropertyDescriptor {
  
    if (debug) {
      const method = propertyDesciptor.value
    
      propertyDesciptor.value = function (...args: any[]) {
    
        // convert list of greet arguments to string
        const params = args.map(a => inspect(a)).join()
  
        // invoke greet() and get its return value
        const result = method.apply(this, args)
  
        // convert result to string
        const r = JSON.stringify(result)
  
        // display in console the function call details
        const methodName: string = `${target.constructor.name}::${propertyName}(${params})`
        print.info('[DEBUG]', `${methodName.padding(100)} => ${r}`)
        // return the result of invoking the method
        return result
      }
    }
  
    return propertyDesciptor
  } 
}