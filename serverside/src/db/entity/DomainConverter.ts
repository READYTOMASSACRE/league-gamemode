export interface Type<T> extends Function {
  new (...args: any[]): T
}

/**
 * Class to convert object from and to DTO
 */
export class DomainConverter {
  /**
   * Convert a dto to the domain
   * @param {Type<T>} domain 
   * @param {any} dto 
   */
  static fromDto<T>(domain: Type<T>, dto: any): T {
    return new domain(dto)
  }

  /**
   * Convert a domain to the dto
   * @param {Type<T>} domain 
   */
  static toDto<T>(domain: any): T {
    return domain.state
  }
}