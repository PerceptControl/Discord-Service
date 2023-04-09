import type { DiscordServiceStateManager } from '../Classes/state_manager.js'

import { Logger } from '../Utils/logger.js'
const logger = new Logger('Discord', 'Voice Guard')

export function guardCommandVoice(manager: DiscordServiceStateManager) {
  logger.trace(`PROTECTING. MANAGER: ${manager.channelName}`)
  let channelCommand = manager.channelCommand
  let memberCommand = manager.memberCommand
  if (!memberCommand) {
    manager.channel = null
    return
  }

  if (channelCommand != memberCommand) {
    manager.channel = null
    return
  }
}
