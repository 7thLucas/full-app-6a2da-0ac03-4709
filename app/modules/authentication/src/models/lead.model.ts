import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type LeadStatus = "New" | "Contacted" | "Booked" | "Converted" | "Lost";

@modelOptions({
  schemaOptions: { collection: "tbl_leads", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Lead extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "" })
  email!: string;

  // Google Ads, Facebook, Website, Walk-in, Referral, etc.
  @prop({ type: String, default: "Website" })
  source!: string;

  @prop({ type: String, default: "" })
  treatment!: string;

  @prop({ type: String, default: "New", index: true })
  status!: LeadStatus;

  @prop({ type: Number, default: 0 })
  estimatedValue!: number;

  @prop({ type: String, default: "" })
  notes!: string;

  @prop({ type: Date })
  lastContactedAt?: Date;
}

export const LeadModel = getModelForClass(Lead);
