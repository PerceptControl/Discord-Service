import { DTO } from './dto.js'
import { ServiceError } from './service_error.js'
import { Logger } from './logger.js'

export class ServiceParser {
  private static _logger = new Logger('Parser')
  static to_json(dto: DTO.Interface): string | never {
    try {
      return JSON.stringify({
        operation: dto.operation,
        status: dto.status,
        payload: dto.payload,
      })
    } catch (e) {
      let err_message: string

      if (e instanceof Error) err_message = e.message
      else if (typeof e == 'string') err_message = e
      else err_message = 'unknown error'

      this._logger.warning(err_message)
      throw new ServiceError('Parser', err_message)
    }
  }
  static to_dto_object(data: string): DTO.Interface | never {
    try {
      return new DTO.Instance(JSON.parse(data))
    } catch (e) {
      let err_message: string

      if (e instanceof Error) err_message = e.message
      else if (typeof e == 'string') err_message = e
      else err_message = 'unknown error'

      this._logger.warning(err_message)
      throw new ServiceError('Parser', err_message)
    }
  }
}
