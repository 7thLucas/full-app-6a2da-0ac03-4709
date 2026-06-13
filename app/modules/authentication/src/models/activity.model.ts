import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// type: lead_created | appointment_booked | message_sent | review_requested | status_changed | reminder_sent
@modelOptions({
  schemaOptions: { collection: "tbl_activities", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Activity extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  @prop({ type: String, required: true })
  type!: string;

  @prop({ type: String, default: "" })
  title!: string;

  @prop({ type: String, default: "" })
  description!: string;

  @prop({ type: Object, default: {} })
  meta!: Record<string, any>;
}

export const ActivityModel = getModelForClass(Activity);
