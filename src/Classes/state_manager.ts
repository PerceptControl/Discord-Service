import type { GuildBasedChannel, VoiceState } from 'discord.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceStateManager {
  private _logger = new Logger('Discord', 'State manager')
  constructor(private _state: VoiceState) {}

  get channel_guild() {
    return this._state.guild
  }

  get channel_lobby_id() {
    return this._name_parts?.id
  }

  get channel_lobby_command() {
    return this._name_parts?.command
  }

  get member_lobby_id() {
    const role = this._state.member?.roles.cache.find((role) => {
      if (role.name.startsWith('mm-')) return true
    })
    if (role) return role.name.split('-')[1]
  }

  get member_lobby_command() {
    return this._state.member?.roles.cache.find((role) => {
      if (role.name.startsWith('command')) return true
    })?.name
  }

  get isCommandVoice() {
    if (!this._state.channel?.name.includes('command')) return false
    return true
  }

  get isDistributor() {
    if (
      this._state.channel?.name == 'Распределитель' ||
      this._state.channel?.name == 'Distributor'
    )
      return true
    return false
  }

  get inChannel() {
    if (!this._state.channel || this._state.channel.name == 'Распределитель')
      return false
    return true
  }

  set channel(channel: GuildBasedChannel) {
    if (!channel.isVoiceBased()) return
    this._state.setChannel(channel).catch((e) => {
      this._logger.critical(e)
    })
  }

  drop_member_from_channel() {
    this._state.setChannel(null).catch((e) => {
      this._logger.critical(e)
    })
  }

  private get _name_parts() {
    const splits = this._state.channel?.name.split('-')
    if (!splits) return
    return {
      id: splits[1],
      command: splits[2],
    }
  }
}
