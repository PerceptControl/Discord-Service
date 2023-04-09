import { ServiceError } from './service_error.js'
import { ServiceParser } from './parser.js'

export namespace DTO {
  export type Request = {
    operation: Extract<OPERATION, 'request'>
    payload: USEFUL_DATA
  }

  export type Response = {
    operation: Extract<OPERATION, 'response'>
    status: STATUS
    payload: USEFUL_DATA
  }

  export type OPERATION = 'request' | 'response'
  export type STATUS = 'success' | 'error'
  export type USEFUL_DATA = string | { [key: string]: unknown }

  export type MEMBER_COMMAND = 'command1' | 'command2'

  export interface Interface {
    get as_json(): string
    get operation(): OPERATION
    get status(): STATUS | undefined
    get payload(): USEFUL_DATA
  }

  export class Instance implements Interface {
    readonly operation!: OPERATION
    readonly status: STATUS | undefined
    readonly payload!: USEFUL_DATA

    constructor(packet: { [key: string]: unknown }) {
      if (this.is_correct_operation(packet['operation']))
        this.operation = packet['operation']
      else throw new ServiceError('DTO', 'invalid operation')

      if (this.is_correct_payload(packet['payload']))
        this.payload = packet['payload']
      else throw new ServiceError('DTO', 'invalid payload')

      if (this.is_correct_status(packet['status']))
        this.status = packet['status']
    }

    get as_json(): string {
      return ServiceParser.to_json(this)
    }

    private is_correct_operation(value: unknown): value is OPERATION {
      if (typeof value != 'string') return false
      if (value != 'request' && value != 'response') return false
      return true
    }

    private is_correct_status(value: unknown): value is STATUS {
      if (typeof value != 'string') return false
      if (value != 'success' && value != 'error') return false
      return true
    }

    private is_correct_payload(value: unknown): value is USEFUL_DATA {
      if (!value) return false
      if (typeof value != 'string' && typeof value != 'object') return false
      return true
    }
  }
}
