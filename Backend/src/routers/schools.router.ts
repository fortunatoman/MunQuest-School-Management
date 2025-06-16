import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getSchools, updateSchoolStatus, deleteSchool, updateSchool, createSchool, mergeShools } from "../controllers/school.controller";

const router = Router();

router.get("/all-schools", authenticateToken, getSchools);
router.post("/create-school", authenticateToken, createSchool);
router.patch("/update-school/:schoolId", authenticateToken, updateSchool);
router.patch("/update-school-status/:schoolId", authenticateToken, updateSchoolStatus);
router.delete("/delete-school/:schoolId", authenticateToken, deleteSchool);
router.post("/merge-shools", authenticateToken, mergeShools);

export default router;
