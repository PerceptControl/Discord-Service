import type { Guild } from 'discord.js'
import type { DiscordServiceStateManager } from '../Classes/state_manager.js'
import { DiscordServiceChannelManager } from '../Classes/channel_manager.js'

export function distribute(guild: Guild, manager: DiscordServiceStateManager) {
  const [lobby_id, member_command] = [
    manager.member_lobby_id,
    manager.member_lobby_command,
  ]
  if (!lobby_id || !member_command) return manager.drop_member_from_channel()

  const channel = DiscordServiceChannelManager.find(guild, [
    `mm-${lobby_id}-${member_command}`,
  ])?.at(0)

  if (!channel) return manager.drop_member_from_channel()

  manager.channel = channel
}
