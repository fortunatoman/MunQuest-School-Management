import { Router } from "express";
import { addLeadershipRole, getLeadershipRoles, updateLeadershipRole, deleteLeadershipRole } from "../controllers/leadership_role.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/all-leadership-roles", authenticateToken, getLeadershipRoles);
router.post("/add-leadership-role", authenticateToken, addLeadershipRole);
router.patch("/update-leadership-role/:leadershipRoleId", authenticateToken, updateLeadershipRole);
router.delete("/delete-leadership-role/:leadershipRoleId", authenticateToken, deleteLeadershipRole);

export default router;
