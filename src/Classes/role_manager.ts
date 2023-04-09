import type { Guild, Role } from 'discord.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceRoleManager {
  private static logger = new Logger('Discord', 'Role manager')
  static createRole(guild: Guild, name: string) {
    return guild.roles.create({ name }).catch((e) => {
      this.logger.critical(e)
    })
  }

  static deleteRoles(guild: Guild, names: string[]) {
    try {
      const roles = this.findRoles(guild, names)
      if (!roles) return
      const promises: Promise<Role>[] = []
      for (let role of roles) promises.push(role.delete())

      Promise.all(promises).catch((e) => {
        this.logger.critical(e)
      })
    } catch (e) {
      this.logger.critical(e)
    }
  }

  static findRoles(guild: Guild, names: string[]) {
    try {
      const roles = Array.from(guild.roles.cache.values())
      return roles.filter((role) => {
        if (names.includes(role.name)) return true
        return false
      })
    } catch (e) {
      this.logger.critical(e)
    }
  }
}
