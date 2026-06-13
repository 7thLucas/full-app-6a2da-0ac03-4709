import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type MessageChannel = "sms" | "email";
export type MessageDirection = "inbound" | "outbound";

@modelOptions({
  schemaOptions: { collection: "tbl_messages", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Message extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  // Patient/lead this thread belongs to (lead id or appointment-derived contact)
  @prop({ type: String, required: true, index: true })
  contactId!: string;

  @prop({ type: String, default: "" })
  contactName!: string;

  @prop({ type: String, default: "sms" })
  channel!: MessageChannel;

  @prop({ type: String, default: "outbound" })
  direction!: MessageDirection;

  @prop({ type: String, default: "" })
  body!: string;

  // true when sent by an automation workflow (vs. manual staff send)
  @prop({ type: Boolean, default: false })
  isAutomated!: boolean;

  @prop({ type: Boolean, default: false })
  read!: boolean;
}

export const MessageModel = getModelForClass(Message);
