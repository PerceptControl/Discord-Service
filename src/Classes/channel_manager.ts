import type { Channel, Guild, Role, VoiceChannel } from 'discord.js'
import { ChannelType, PermissionsBitField } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { DTO } from '../Utils/dto.js'
import { Logger } from '../Utils/logger.js'

type VoiceOrUndefined = void | VoiceChannel

export class DiscordServiceChannelManager {
  private static logger = new Logger('Discrod', 'Channel manager')

  static async createChannelsForMatch(guild: Guild, id: string) {
    return Promise.all([
      this.createChannelForTeam(guild, id, 'command1'),
      this.createChannelForTeam(guild, id, 'command2'),
    ])
      .then((channels) => {
        if (!(channels instanceof Array)) return
        if (channels.includes(undefined)) {
          for (let channel of channels) if (channel) channel.delete()
          return
        }
        this.logger.trace(`channel for match [${id}] created`)
        return channels
      })
      .catch((e) => {
        this.logger.critical(e)
      })
  }

  static deleteChannelsForMatch(guild: Guild, id: string) {
    Promise.all([
      this.deleteChannelForTeam(guild, id, 'command1'),
      this.deleteChannelForTeam(guild, id, 'command2'),
    ])
      .then(() => {
        this.logger.trace(`channel for match [${id}] deleted`)
      })
      .catch((e) => {
        this.logger.critical(e)
      })
  }

  static findChannelForTeam(
    guild: Guild,
    teamID: string,
    command: DTO.MEMBER_COMMAND,
  ) {
    try {
      return DiscordServiceChannelManager.findChannel(
        guild,
        `${command}#${teamID}`,
      )
    } catch (e) {
      this.logger.critical(e)
    }
  }

  private static async createChannelForTeam(
    guild: Guild,
    id: string,
    command: DTO.MEMBER_COMMAND,
  ) {
    try {
      const roles = DiscordServiceRoleManager.findRoles(guild, [
        `mm_team#${id}`,
      ])
      if (!roles) return
      return this.createPrivateChannel(guild, `${command}#${id}`, roles[0])
    } catch (e) {
      this.logger.critical(e)
    }
  }

  private static async deleteChannelForTeam(
    guild: Guild,
    id: string,
    command: DTO.MEMBER_COMMAND,
  ) {
    try {
      return this.findChannel(guild, `${command}#${id}`)?.delete()
    } catch (e) {
      this.logger.critical(e)
    }
  }

  private static findChannel(guild: Guild, name: string) {
    try {
      return guild.channels.cache.find((channel) => {
        return channel && channel.name == name
      })
    } catch (e) {
      this.logger.critical(e)
    }
  }

  private static async createPrivateChannel(
    guild: Guild,
    name: string,
    role: Role,
  ) {
    return guild.channels
      .create({
        name,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
          {
            id: role.id,
            allow: [
              PermissionsBitField.Flags.Connect,
              PermissionsBitField.Flags.Speak,
            ],
          },
          {
            id: guild.roles.everyone,
            deny: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.Connect,
              PermissionsBitField.Flags.Speak,
            ],
          },
        ],
      })
      .catch((e) => {
        this.logger.critical(e)
      })
  }
}
