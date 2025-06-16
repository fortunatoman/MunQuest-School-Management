import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { getCountries } from "../controllers/countries.controller";

const router = Router();

router.get("/all-countries", authenticateToken, getCountries);


export default router;