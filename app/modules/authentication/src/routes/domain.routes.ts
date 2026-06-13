import { Router } from "express";
import { requireAuth } from "../../authentication.middleware";
import {
  attachOrg,
  getOrg,
  updateOrg,
  getDashboard,
  getReports,
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  importLeads,
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  sendReminder,
  listThreads,
  getThread,
  sendMessage,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listWorkflows,
  updateWorkflow,
  listStaff,
  inviteStaff,
} from "../controllers/domain.controller";

const router = Router();

// Everything below requires an authenticated user + a resolved organization.
router.use("/app", requireAuth, attachOrg);

router.get("/app/org", getOrg);
router.patch("/app/org", updateOrg);

router.get("/app/dashboard", getDashboard);
router.get("/app/reports", getReports);

router.get("/app/leads", listLeads);
router.post("/app/leads", createLead);
router.post("/app/leads/import", importLeads);
router.get("/app/leads/:id", getLead);
router.patch("/app/leads/:id", updateLead);
router.delete("/app/leads/:id", deleteLead);

router.get("/app/appointments", listAppointments);
router.post("/app/appointments", createAppointment);
router.patch("/app/appointments/:id", updateAppointment);
router.delete("/app/appointments/:id", deleteAppointment);
router.post("/app/appointments/:id/reminder", sendReminder);

router.get("/app/messages/threads", listThreads);
router.get("/app/messages/thread/:contactId", getThread);
router.post("/app/messages", sendMessage);

router.get("/app/templates", listTemplates);
router.post("/app/templates", createTemplate);
router.patch("/app/templates/:id", updateTemplate);
router.delete("/app/templates/:id", deleteTemplate);

router.get("/app/workflows", listWorkflows);
router.patch("/app/workflows/:id", updateWorkflow);

router.get("/app/staff", listStaff);
router.post("/app/staff/invite", inviteStaff);

export default router;
