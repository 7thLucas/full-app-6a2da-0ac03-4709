import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Workflow keys: lead_follow_up | appointment_reminder | re_engagement | review_request
@modelOptions({
  schemaOptions: { collection: "tbl_workflows", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Workflow extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  @prop({ type: String, required: true })
  key!: string;

  @prop({ type: String, default: "" })
  name!: string;

  @prop({ type: Boolean, default: true })
  enabled!: boolean;

  // n8n-compatible webhook endpoint that fires this workflow
  @prop({ type: String, default: "" })
  webhookUrl!: string;

  // SMS + email message templates for this workflow
  @prop({ type: String, default: "" })
  smsTemplate!: string;

  @prop({ type: String, default: "" })
  emailTemplate!: string;

  // Workflow-specific config (steps, timings, days, reminder hours, etc.)
  @prop({ type: Object, default: {} })
  config!: Record<string, any>;
}

export const WorkflowModel = getModelForClass(Workflow);
