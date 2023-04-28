import type { Guild, GuildMember, Role } from 'discord.js'
import { Logger } from '../Utils/logger.js'

export class DiscordServiceRoleManager {
  private static _logger = new Logger('Discord', 'Role manager')
  static create(guild: Guild, names: string[]) {
    const creationPromises: Promise<Role>[] = []
    for (let name of names) creationPromises.push(guild.roles.create({ name }))
    return Promise.all(creationPromises)
      .catch((e) => {
        this._logger.critical(e)
      })
      .then((roles) => {
        this._logger.info(`Roles ${names} created.`)
        return roles
      })
  }

  static delete(guild: Guild, names: string[]) {
    try {
      const roles = this.find(guild, names)
      if (!roles) return
      const promises: Promise<Role>[] = []
      for (let role of roles) promises.push(role.delete())

      Promise.all(promises)
        .catch((e) => {
          this._logger.warning(e)
        })
        .then(() => {
          this._logger.info(`Roles ${names} deleted.`)
        })
    } catch (e) {
      this._logger.critical(e)
    }
  }

  static find(guild: Guild, names: string[]) {
    try {
      const roles = Array.from(guild.roles.cache.values())
      return roles.filter((role) => {
        if (names.includes(role.name)) return true
        return false
      })
    } catch (e) {
      this._logger.warning(e)
    }
  }

  static add(member: GuildMember, roles: string[]) {}
}
