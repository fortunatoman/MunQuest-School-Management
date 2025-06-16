import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getLocalities, updateLocality, deleteLocality, mergeLocality } from "../controllers/locality.controller";
const router = Router();

router.get("/all-localities", authenticateToken, getLocalities);
router.patch("/update-locality/:localityId", authenticateToken, updateLocality);
router.delete("/delete-locality/:localityId", authenticateToken, deleteLocality);
router.post("/localities/merge-localities", authenticateToken, mergeLocality);

export default router;
