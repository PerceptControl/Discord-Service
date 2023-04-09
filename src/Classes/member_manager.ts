import { Guild, GuildMember } from 'discord.js'
import { DiscordServiceRoleManager } from './role_manager.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceGuildMemberManager {
  private static logger = new Logger('Discord', 'Member manager')
  static findMemberById(id: string, guild: Guild): GuildMember | undefined {
    if (guild.members.cache.has(id)) return guild.members.cache.get(id)
  }

  static findMemberByNick(nick: string, guild: Guild): GuildMember | undefined {
    for (let [, member] of guild.members.cache)
      if (member.nickname == nick) return member
  }

  static addRole(nick: string, guild: Guild, roleNames: string[]) {
    const roles = DiscordServiceRoleManager.findRoles(guild, roleNames)
    if (!roles) return false

    const member = this.findMemberByNick(nick, guild)
    if (!member) return
    member.roles.add(roles).catch((e) => {
      this.logger.critical(e)
    })

    const promises = []
    for (let role of roles)
      if (role.members.size == 0) promises.push(role.delete())

    Promise.all(promises).catch((e) => {
      this.logger.critical(e)
    })
  }

  static removeRole(nick: string, guild: Guild, roleNames: string[]) {
    const roles = DiscordServiceRoleManager.findRoles(guild, roleNames)
    if (!roles) return false

    const member = this.findMemberByNick(nick, guild)
    if (!member) return
    member.roles.remove(roles).catch((e) => {
      if (e instanceof Error)
        this.logger.critical(`MESSAGE: ${e.message}; STACK: ${e.stack}`)
      else if (typeof e == 'string') this.logger.critical(e)
    })

    const promises = []
    for (let role of roles)
      if (role.members.size == 0) promises.push(role.delete())

    Promise.all(promises).catch((e) => {
      this.logger.critical(e)
    })
  }
}
