import { Router } from "express";
import { addCommittee, getCommittees, updateCommittee, deleteCommittee } from "../controllers/committe.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/all-committees", authenticateToken, getCommittees);
router.post("/add-committee", authenticateToken, addCommittee);
router.patch("/update-committee/:committeeId", authenticateToken, updateCommittee);
router.delete("/delete-committee/:committeeId", authenticateToken, deleteCommittee);

export default router;
