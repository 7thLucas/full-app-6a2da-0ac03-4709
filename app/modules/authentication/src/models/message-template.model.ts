import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_message_templates", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class MessageTemplate extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  @prop({ type: String, required: true })
  name!: string;

  // sms | email
  @prop({ type: String, default: "sms" })
  channel!: string;

  @prop({ type: String, default: "" })
  body!: string;
}

export const MessageTemplateModel = getModelForClass(MessageTemplate);
