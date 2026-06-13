import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: { collection: "tbl_organizations", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Organization extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  address!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "America/New_York" })
  timezone!: string;

  @prop({ type: String, default: "en" })
  language!: string;

  @prop({ type: String, default: "Starter" })
  plan!: string;

  // Owner user id (string id of the User who created the org)
  @prop({ type: String, required: true, index: true })
  ownerId!: string;

  // Integration / webhook configuration (n8n, Twilio, etc.)
  @prop({ type: Object, default: {} })
  integrations!: Record<string, any>;
}

export const OrganizationModel = getModelForClass(Organization);
