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
import { DiscordServiceGuildMemberManager } from './member_manager.js'
import { DiscordServiceGuildManager } from './guild_manager.js'
import { distribute } from '../Hooks/distributor.js'

import { Logger } from '../Utils/logger.js'
import { ServiceError } from '../Utils/service_error.js'
import { ChannelModel } from '../Models/index.js'

export declare const FIRST_COMMAND_ROLE_NAME = 'command1'
export declare const SECOND_COMMAND_ROLE_NAME = 'command2'
export declare type Member = {
  name: string
  command: typeof FIRST_COMMAND_ROLE_NAME | typeof SECOND_COMMAND_ROLE_NAME
}

//TODO реализовать методы createLobby, removeLobby, checkLobby

export class DiscordServiceCore {
  private _logger = new Logger('core', 'discord-client')
  private _client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
  })
  constructor(token: string) {
    DiscordServiceGuildManager.client = this._client
    this._client
      .login(token)
      .then(async () => {
        this._logger.info('LOGGED IN')
        this._guilds = await this._client.guilds.fetch()
      })
      .catch((e) => this._logger.critical(e))
  }

  removeLobby(guild: Guild, id: string) {
    this._logger.info(`DELETING LOBBY#${id}`)
    return guild
      .fetch()
      .then((guild) => {
        DiscordServiceRoleManager.delete(guild, [`mm_lobby-${id}`])
        DiscordServiceChannelManager.delete(guild, [
          `command1-${id}`,
          `command2-${id}`,
        ])
        ChannelModel.remove(id)
      })
      .catch((e) => {
        this._logger.fatal(e)
      })
  }

  createLobby(id: string, members: Member[]) {
    this._logger.info(`CREATING LOBBY#${id}`)
    return DiscordServiceGuildManager.findGuildWithSpaceForNewVoiceChannel()
      ?.fetch()
      .then(async (guild) => {
        try {
          await this._checkCommandRolesInGuild(guild)

          const LOBBY_CONFIGURATION =
            DiscordServiceChannelManager.getLobbyChannelConfiguration(id)

          const roles = await DiscordServiceRoleManager.create(guild, [
            LOBBY_CONFIGURATION.lobby_role_name,
          ])
          if (!roles) throw new ServiceError('Role Manager', 'creation failed')

          await DiscordServiceChannelManager.create(
            guild,
            LOBBY_CONFIGURATION.creation_payload,
          )

          for (let member of members) {
            DiscordServiceGuildMemberManager.addRole(member.name, guild, [
              LOBBY_CONFIGURATION.lobby_role_name,
              member.command,
            ]).then(() => {
              this.addUserToTeamVoiceChannel(guild, member.name)
            })
          }

          ChannelModel.add(id, members)
        } catch (e) {
          this._logger.fatal(e)
        }
      })
      .catch((e) => {
        this._logger.fatal(e)
      })
  }

  addUserToTeamVoiceChannel(guild: Guild, nick: string) {
    this._logger.info(`${nick} CONNECTING TO VOICE`)
    const member = DiscordServiceGuildMemberManager.findMemberByNick(
      guild,
      nick,
    )
    if (!member || !member.voice.channelId) return

    distribute(guild, new DiscordServiceStateManager(member.voice))
  }

  private async _checkCommandRolesInGuild(guild: Guild) {
    const commandRoles = DiscordServiceRoleManager.find(guild, [
      FIRST_COMMAND_ROLE_NAME,
      SECOND_COMMAND_ROLE_NAME,
    ])
    if (!commandRoles || commandRoles.length < 2)
      return DiscordServiceRoleManager.create(guild, [
        FIRST_COMMAND_ROLE_NAME,
        SECOND_COMMAND_ROLE_NAME,
      ])
  }
}
