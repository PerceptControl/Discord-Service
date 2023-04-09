import { VoiceState } from 'discord.js'
import { DiscordServiceStateManager } from '../Classes/state_manager.js'
import { distribute } from '../Hooks/distributor.js'
import { guardCommandVoice } from '../Hooks/voice_guard.js'
import { DISCORD_ROBOT } from '../app.js'

export async function state_update(oldState: VoiceState, newState: VoiceState) {
  if (!newState.channel) return
  let state = new DiscordServiceStateManager(newState, DISCORD_ROBOT)
  let guild = await DISCORD_ROBOT.guildWithFreeChannelsForVoice
  if (!guild) {
    state.channel = null
    return
  }
  if (state.isDistributor) distribute(state, guild)
  if (state.isCommandVoice) guardCommandVoice(state)
}
