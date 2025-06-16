import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    uploadGeneralDocument,
    getGeneralDocument,
    saveGeneralDocument,
    deleteGeneralDocument,
    getGeneralDocumentByEvent
} from "../controllers/general_document.controller";
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

router.post("/upload-general-document", authenticateToken, upload.single('file'), uploadGeneralDocument);
router.get("/get-general-documents-by-event/:eventId", authenticateToken, getGeneralDocument);
router.post("/save-general-document", authenticateToken, saveGeneralDocument);
router.delete("/delete-general-document/:id", authenticateToken, deleteGeneralDocument);

router.get("/get-all-documents-by-event-Id/:eventId", authenticateToken, getGeneralDocumentByEvent);

export default router;
