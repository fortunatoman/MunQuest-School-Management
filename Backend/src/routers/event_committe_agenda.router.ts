import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    getAllEventCommitteeAgenda, saveEventCommitteeAgenda, updateEventCommitteeAgenda,
    deleteEventCommitteeAgenda, uploadEventCommitteeAgendaDocument,
    getEventCommitteeAgendaDocument,
    saveEventCommitteeAgendaDocument,
    deleteEventCommitteeAgendaDocument
} from "../controllers/event_committe_agenda.controller";
import multer from "multer";

const router = Router();


// Configure multer with file type validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG files are allowed.'));
        }
    }
});

router.post("/save-agenda", authenticateToken, saveEventCommitteeAgenda);
router.get("/get-event-committees-agendas-by-event/:eventId", authenticateToken, getAllEventCommitteeAgenda);
router.patch("/update-event-committees-agendas-by-id/:id", authenticateToken, updateEventCommitteeAgenda);
router.delete("/delete-event-committees-agendas-by-id/:id", authenticateToken, deleteEventCommitteeAgenda);

router.post("/upload-agenda-document", authenticateToken, upload.single('file'), uploadEventCommitteeAgendaDocument);
router.get("/get-agenda-documents-by-event/:eventId/:committeeId", authenticateToken, getEventCommitteeAgendaDocument);
router.post("/save-event-committee-document", authenticateToken, saveEventCommitteeAgendaDocument);
router.delete("/delete-event-committee-document/:id", authenticateToken, deleteEventCommitteeAgendaDocument);

export default router;
