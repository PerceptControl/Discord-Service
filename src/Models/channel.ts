import { prop, ReturnModelType } from '@typegoose/typegoose'
import { ServiceError } from '../Utils/service_error.js'
import { Member } from '../Classes/core.js'
import { Logger } from '../Utils/logger.js'

export class ChannelsList {
  private static _logger = new Logger('Mongo', 'Channel List')
  @prop({ required: true, unique: true })
  lobby_id!: string
  @prop({ required: true, type: () => Date })
  creation_date!: Date
  @prop({ type: () => String, default: [], _id: false })
  members!: string[]

  static async add(
    this: ReturnModelType<typeof ChannelsList>,
    lobby_id: string,
    members: Member[],
  ) {
    try {
      if ((await this.findOne({ lobby_id })) != undefined)
        throw new ServiceError('Channel List', 'lobby channel alredy exist')

      const members_names = []
      for (let member of members) members_names.push(member.name)

      const creation_date = new Date()

      await this.create({
        lobby_id,
        creation_date,
        members,
      })
    } catch (e) {
      this._logger.warning(e)
    }
  }

  static async remove(
    this: ReturnModelType<typeof ChannelsList>,
    lobby_id: string,
  ) {
    try {
      if ((await this.findOne({ lobby_id })) == undefined)
        throw new ServiceError('Channel List', 'lobby channel not exist')
      await this.deleteOne({ lobby_id })
    } catch (e) {
      this._logger.warning(e)
    }
  }
}
