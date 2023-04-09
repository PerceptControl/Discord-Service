import { getModelForClass } from '@typegoose/typegoose'
import { Channel } from './channel.js'
export const ChannelModel = getModelForClass(Channel)
