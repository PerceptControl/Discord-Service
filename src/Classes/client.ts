import {
  Client,
  Collection,
  GatewayIntentBits,
  Guild,
  OAuth2Guild,
} from 'discord.js'
import { DiscordServiceChannelManager } from './channel_manager.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { DiscordServiceStateManager } from './state_manager.js'
import { distribute } from '../Hooks/distributor.js'

import { Logger } from '../Utils/logger.js'
import { DTO } from '../Utils/dto.js'

//TODO реализовать методы createLobby, removeLobby, checkLobby
export class DiscordClient {
  private _logger = new Logger('core', 'discord-client')
  public client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
  })
  private _guilds!: Collection<string, OAuth2Guild>
  constructor(token: string) {
    this.client
      .login(token)
      .then(async () => {
        this._logger.info('LOGGED IN')
        this._guilds = await this.client.guilds.fetch()
      })
      .catch((e) => this._logger.critical(e))
  }

  removeLobby(guild: Guild, id: string) {
    this._logger.info('CLEANING LOBBY DATA')
    return guild
      .fetch()
      .then((guild) => {
        DiscordServiceRoleManager.deleteTeamRole(guild, id).catch((e) => {
          this._logger.critical(e)
        })
        for (let [_, channel] of guild.channels.cache) {
          if (
            channel.name == `command1#${id}` ||
            channel.name == `command2#${id}`
          )
            channel.delete()
        }
      })
      .catch((e) => {
        this._logger.critical(e)
      })
  }

  //TODO работа с войсом
  addUserToTeamVoiceChannel(nick: string) {
    this._logger.info(`${nick} CONNECTING TO VOICE`)
    let result = this._findUserByNicknameForMatchMaking(nick)
    if (!result) return
    return result
      .then((result) => {
        this._logger.trace(`USER DATA: ${JSON.stringify(result)}`)
        if (!result || !result.user.voice || !result.user.voice.channelId)
          return
        distribute(
          new DiscordServiceStateManager(result.user.voice, this),
          result.guild,
        )
      })
      .catch((e) => {
        this._logger.warning(e)
      })
  }

  private _findUserByNicknameForMatchMaking(nick: string) {
    for (let [_, guild] of this._guilds)
      return guild.fetch().then((fetchedGuild) => {
        return this.getMemberByNickanme(fetchedGuild, nick).then((user) => {
          if (
            user &&
            user.roles.cache.find((role) => {
              if (role.name.includes('mm_')) return true
              return false
            })
          )
            return { guild: fetchedGuild, user }
        })
      })
  }
}
