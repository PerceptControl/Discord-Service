import { getModelForClass } from '@typegoose/typegoose'
import { ChannelsList } from './channel.js'
export const ChannelModel = getModelForClass(ChannelsList)
