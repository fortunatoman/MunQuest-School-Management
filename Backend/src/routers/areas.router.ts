import { Router } from "express";
import { getAreas, deleteArea, updateArea, createArea, updateAreaStatus } from "../controllers/area.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/all-areas", authenticateToken, getAreas);
router.post("/create-area", authenticateToken, createArea);
router.delete("/delete-area/:areaId", authenticateToken, deleteArea);
router.patch("/update-area/:areaId", authenticateToken, updateArea);
router.patch("/update-area-status/:areaId", authenticateToken, updateAreaStatus);

export default router;
