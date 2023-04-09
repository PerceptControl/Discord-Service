import mongoose from 'mongoose'
import { Logger } from './Utils/logger.js'
import express = require('express')

import { DiscordClient } from './Classes/client.js'
import { state_update } from './Controllers/voice_state_update.js'
import { ServiceError } from './Utils/service_error.js'

export const DISCORD_ROBOT = new DiscordClient(
  process.env.DISCORD_TOKEN as string,
)
DISCORD_ROBOT.client.on('ready', (client) => console.log('discord bot ready'))
DISCORD_ROBOT.client.on('voiceStateUpdate', state_update)

const express_logger = new Logger('core', 'express')
const database_logger = new Logger('core', 'database')

const app = express()
app.use(express.json())

mongoose
  .connect(process.env.MONGO_CONN_STR as string)
  .catch((error: Error) => {
    database_logger.fatal(`message: ${error.message}; stack: ${error.stack}`)
  })
  .then(() => {
    database_logger.info('connected to mongodb')
    require('./Models')
    database_logger.info('models initialized')
  })

app.use('/', require('./Routes'))

app.use(function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  next(new ServiceError('API', 'Not Found'))
})

app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  res.status(err.status || 500)
  if (err instanceof ServiceError) return res.json(err.to_dto.as_json)
  else if (err instanceof Error) return res.json({ message: err.message })
  res.json({ status: '500' })
})

app.listen(process.env.PORT as string, function () {
  express_logger.info('server started')
})
