import { Router } from "express";
import { getAllEventCommittees, saveEventCommittee, updateEventCommitteeByEvent, deleteEventCommittee } from "../controllers/event_committe.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// router.post("/event-registration-teacher/:userId", authenticateToken, eventRegistrationTeacher);
// router.post("/event-registration-student/:userId", authenticateToken, eventRegistrationStudent);
router.get("/get-all-event-committees/:eventId", authenticateToken, getAllEventCommittees);
router.post("/save-event-committees-by-event", authenticateToken, saveEventCommittee);
router.patch("/update-event-committees-by-event/:id", authenticateToken, updateEventCommitteeByEvent);
router.delete("/delete-event-committees-by-event/:id", authenticateToken, deleteEventCommittee);


export default router;
