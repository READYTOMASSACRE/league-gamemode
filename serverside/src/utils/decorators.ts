import { magenta } from 'colors'
import { inspect, formatWithOptions } from 'util'

export function logMethod(debug?: boolean) {
  return function (
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor): PropertyDescriptor {
  
    if (debug) {
      const method = propertyDesciptor.value
    
      propertyDesciptor.value = function (...args: any[]) {
    
        // convert list of greet arguments to string
        const params = args.map(a => formatWithOptions({colors: true}, '%j', a)).join()
  
        // invoke greet() and get its return value
        const result = method.apply(this, args)
  
        // convert result to string
        const r = JSON.stringify(result)
  
        // display in console the function call details
        const methodName: string = `${target.constructor.name}::${magenta(propertyName)}(${params})`
        console.log(magenta('[DEBUG]'), `${methodName.padding(100)} => ${r}`)
        // return the result of invoking the method
        return result
      }
    }
  
    return propertyDesciptor
  } 
}