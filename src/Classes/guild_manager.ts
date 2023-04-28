import { Client, Guild } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { Logger } from '../Utils/logger.js'
import { ServiceError } from '../Utils/service_error.js'
import { DiscordServiceChannelManager } from './channel_manager.js'

export class DiscordServiceGuildManager {
  private static _logger = new Logger('Discord', 'Guild Manager')
  static client?: Client
  static findGuildWithCustomChannels(names: string[]) {
    return this.client?.guilds.cache.find((guild) => {
      const roles = DiscordServiceRoleManager.find(guild, names)
      if (!roles || roles.length < names.length) return false
      return true
    })
  }

  static findGuildWithSpaceForNewVoiceChannel() {
    for (let guildPair of this.client!.guilds.cache) {
      if (!guildPair)
        throw new ServiceError('guild manager', `empty space in guild cache`)
      const [_, guild] = guildPair
      if (DiscordServiceChannelManager.hasSpace(guild)) return guild
    }
  }
}
