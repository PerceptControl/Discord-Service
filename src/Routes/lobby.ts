import express = require('express')
import { ServiceParser } from '../Utils/parser.js'
import { ServiceError } from '../Utils/service_error.js'
import { DTO } from '../Utils/dto.js'
export const router = express.Router()

router.post('/create', (req, res, next) => {
  try {
    const DTO = ServiceParser.to_dto_object(req.body)
    if (DTO.operation != 'request' || !isValidPayloadOnCreate(DTO.payload))
      throw new ServiceError('API', 'Invalid request')
  } catch (e) {
    next(e)
  }
})

function isValidPayloadOnCreate(payload: DTO.USEFUL_DATA): boolean {
  if (!(payload instanceof Array)) return false
  for (let member of payload) {
    if (typeof member != 'object') return false
    if (!member['nick'] || typeof member['nick'] != 'string') return false
    if (
      !member['command'] ||
      (member['command'] != 'command1' && member['command'] != 'command2')
    )
      return false
  }
  return true
}
