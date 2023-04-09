import { DTO } from './dto.js'

export class ServiceError extends Error {
  constructor(private _name: string, message: string) {
    super(message)
  }

  get to_dto() {
    const response: DTO.Response = {
      operation: 'response',
      status: 'error',
      payload: `${this.name} Error: ${this.message}`,
    }
    return new DTO.Instance(response)
  }
}
