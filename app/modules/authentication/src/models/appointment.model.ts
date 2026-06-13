import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled" | "No-Show" | "Completed";

@modelOptions({
  schemaOptions: { collection: "tbl_appointments", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Appointment extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  orgId!: string;

  // Optional link back to the originating lead
  @prop({ type: String, default: "" })
  leadId!: string;

  @prop({ type: String, required: true })
  patientName!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  treatment!: string;

  @prop({ type: Date, required: true, index: true })
  startAt!: Date;

  @prop({ type: Number, default: 60 })
  durationMinutes!: number;

  @prop({ type: String, default: "Pending", index: true })
  status!: AppointmentStatus;

  @prop({ type: Number, default: 0 })
  value!: number;

  @prop({ type: String, default: "" })
  notes!: string;

  @prop({ type: Date })
  lastReminderAt?: Date;
}

export const AppointmentModel = getModelForClass(Appointment);
