import type { Guild, OverwriteResolvable, VoiceChannel } from 'discord.js'
import { ChannelType, PermissionFlagsBits } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { Logger } from '../Utils/logger.js'

export declare const MAX_CHANNELS_COUNT = 500
export declare type CreationPayload = {
  channel_name: string
  private_role_names: string[]
}

export class DiscordServiceChannelManager {
  private static _logger = new Logger('Discrod', 'Channel manager')

  static create(guild: Guild, payloads: CreationPayload[]) {
    const creationPromises = []
    for (let payload of payloads) {
      const roles = DiscordServiceRoleManager.find(
        guild,
        payload.private_role_names,
      )
      if (!roles) return

      const permissions: OverwriteResolvable[] = []
      for (let role of roles)
        permissions.push({
          id: role,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
        })
      permissions.push({
        id: guild.roles.everyone,
        deny: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
        ],
      })

      creationPromises.push(
        guild.channels
          .create({
            name: payload.channel_name,
            type: ChannelType.GuildVoice,
            permissionOverwrites: permissions,
          })
          .catch((e) => {
            this._logger.critical(e)
          }),
      )
    }

    return Promise.all(creationPromises).then((channels) => {
      for (let channel of channels)
        if (!channel) this.deleteChannelsInstances(channels) //если один из каналов не создался - удаляем все каналы, которые были созданы в ходе текущего вызова
    })
  }

  static find(guild: Guild, names: string[]) {
    try {
      return guild.channels.cache.filter((channel) => {
        return channel && names.includes(channel.name)
      })
    } catch (e) {
      this._logger.critical(e)
    }
  }

  static delete(guild: Guild, names: string[]) {
    return this.find(guild, names)?.forEach((channel) => {
      channel.delete().catch((e) => {
        this._logger.critical(e)
      })
    })
  }

  static hasSpace(guild: Guild): boolean {
    return guild.channels.channelCountWithoutThreads <= MAX_CHANNELS_COUNT
  }

  static getLobbyChannelConfiguration(id: string) {
    const first_command_channel_name = `mm-${id}-command1`
    const second_command_channel_name = `mm-${id}-command2`
    const lobby_role_name = `mm-${id}`

    const FIRST_LOBBY_PAYLOAD: CreationPayload = {
      channel_name: first_command_channel_name,
      private_role_names: [lobby_role_name, 'command1'],
    }

    const SECOND_LOBBY_PAYLOAD: CreationPayload = {
      channel_name: second_command_channel_name,
      private_role_names: [lobby_role_name, 'command2'],
    }

    return {
      lobby_role_name,
      creation_payload: [FIRST_LOBBY_PAYLOAD, SECOND_LOBBY_PAYLOAD],
    }
  }

  private static deleteChannelsInstances(channels: (void | VoiceChannel)[]) {
    for (let channel of channels)
      if (channel)
        channel.delete().catch((e) => {
          this._logger.critical(e)
        })
  }
}
