import { Guild, GuildMember } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceGuildMemberManager {
  private static logger = new Logger('Discord', 'Member manager')
  static findMemberById(guild: Guild, id: string): GuildMember | undefined {
    if (guild.members.cache.has(id)) return guild.members.cache.get(id)
  }

  static findMemberByNick(guild: Guild, nick: string): GuildMember | undefined {
    for (let [, member] of guild.members.cache)
      if (member.nickname == nick) return member
  }

  static addRole(nick: string, guild: Guild, roleNames: string[]) {
    const [roles, member] = [
      DiscordServiceRoleManager.find(guild, roleNames),
      this.findMemberByNick(guild, nick),
    ]
    if (!roles || !member) return Promise.resolve()

    member.roles.add(roles).catch((e) => {
      this.logger.critical(e)
    })

    const promises = []
    for (let role of roles)
      if (role.members.size == 0) promises.push(role.delete())

    return Promise.all(promises).catch((e) => {
      this.logger.critical(e)
    })
  }

  static removeRole(nick: string, guild: Guild, roleNames: string[]) {
    const [roles, member] = [
      DiscordServiceRoleManager.find(guild, roleNames),
      this.findMemberByNick(guild, nick),
    ]
    if (!roles || !member) return Promise.resolve()

    member.roles.remove(roles).catch((e) => {
      if (e instanceof Error)
        this.logger.critical(`MESSAGE: ${e.message}; STACK: ${e.stack}`)
      else if (typeof e == 'string') this.logger.critical(e)
    })

    const promises = []
    for (let role of roles)
      if (role.members.size == 0) promises.push(role.delete())

    return Promise.all(promises).catch((e) => {
      this.logger.critical(e)
    })
  }
}
