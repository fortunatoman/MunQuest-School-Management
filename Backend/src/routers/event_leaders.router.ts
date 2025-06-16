import { Router } from "express";
import { eventRegistrationTeacher, eventRegistrationStudent, saveLeadershipRoleByEvent, 
    updateLeadershipRoleByEvent, deleteLeadershipRoleByEvent, updateLeadershipRoleRankingByEvent } from "../controllers/registeration.controller";
import { getEventLeaders } from "../controllers/event_leader.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/event-registration-teacher/:userId", authenticateToken, eventRegistrationTeacher);
router.post("/event-registration-student/:userId", authenticateToken, eventRegistrationStudent);
router.post("/save-leadership-role-by-event", authenticateToken, saveLeadershipRoleByEvent);
router.get("/get-leadership-roles-by-event/:eventId", authenticateToken, getEventLeaders);
router.patch("/update-leadership-role-by-event/:id", authenticateToken, updateLeadershipRoleByEvent);
router.delete("/delete-leadership-role-by-event/:id", authenticateToken, deleteLeadershipRoleByEvent);
router.patch("/update-leadership-role-ranking-by-event/:id", authenticateToken, updateLeadershipRoleRankingByEvent);

export default router;
