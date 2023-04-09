import { prop, modelOptions } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: { createdAt: 'created_at', updatedAt: false } },
})
export class Channel {
  @prop({ required: true })
  lobby_id!: string
  @prop({ type: () => String, default: [], _id: false })
  members!: string[]
}
