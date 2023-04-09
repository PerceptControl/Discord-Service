import type { Guild } from 'discord.js'
import type { DiscordServiceStateManager } from '../Classes/state_manager.js'
import { Logger } from '../Utils/logger.js'

const logger = new Logger('Discord', 'Distributor')

export function distribute(manager: DiscordServiceStateManager, guild: Guild) {
  logger.trace(
    `DISTRIBUTING. MANAGER: ${manager.channelName} GUILD: ${guild.name}`,
  )
  let memberCommand = manager.memberCommand
  if (!memberCommand) return (manager.channel = null)

  let teamID = manager.memberTeamID
  if (!teamID) return (manager.channel = null)

  manager.channel = guild
}
