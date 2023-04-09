import { Client } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceGuildManager {
  private static logger = new Logger('Discord', 'Guild Manager')
  constructor(private client: Client) {}
  findGuildWithCustomChannels(names: string[]) {
    return this.client.guilds.cache.find((guild) => {
      const roles = DiscordServiceRoleManager.findRoles(guild, names)
      if (!roles || roles.length < names.length) return false
      return true
    })
  }

  findGuildWithSpaceForNewVoiceChannel() {
    for (let guild of this.client.guilds.cache)
      if (guild[1].channels.channelCountWithoutThreads <= 498) return guild[1]
  }
}
