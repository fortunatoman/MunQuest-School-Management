import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.middleware";
import { createEventImagesUpload, createEvent, getCurrentEvents, getCurrentEventsOfOrganiser, getEventById, updateEvent, getAllEvents, updateEventStatus, deleteEvent, checkRegistrationStatus     } from "../controllers/event.controller";

// Configure multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

const router = Router();

router.post("/create-event-images-upload", authenticateToken, upload.single('file'), createEventImagesUpload);
router.post("/create-event/:userId", authenticateToken, createEvent);
router.get("/get-events", authenticateToken, getCurrentEvents);
router.get("/get-events-of-organiser/:userId", authenticateToken, getCurrentEventsOfOrganiser);
router.get("/get-event-by-id/:eventId", authenticateToken, getEventById);
router.patch("/update-event/:eventId", authenticateToken, updateEvent);
router.get("/all-events", authenticateToken, getAllEvents);
router.patch("/update-event-status/:eventId", authenticateToken, updateEventStatus);
router.delete("/delete-event/:eventId", authenticateToken, deleteEvent);
router.get("/check-registration-status/:userId", authenticateToken, checkRegistrationStatus);
export default router;
