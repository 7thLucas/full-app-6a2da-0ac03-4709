import { ActivityModel } from "../models/activity.model";

export class ActivityService {
  static async log(
    orgId: string,
    type: string,
    title: string,
    description = "",
    meta: Record<string, any> = {},
  ) {
    try {
      await ActivityModel.create({ orgId, type, title, description, meta });
    } catch {
      // non-critical — never block the main action on activity logging
    }
  }

  static async recent(orgId: string, limit = 20) {
    return ActivityModel.find({ orgId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
