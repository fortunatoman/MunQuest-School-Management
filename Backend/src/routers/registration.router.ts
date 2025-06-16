import { Router } from "express";
import multer from "multer";
import { eventRegistrationTeacher, eventRegistrationStudent, getRegistrations, getRegistrationsInfoByEventIdAndUserId ,deleteRegistration, deleteDelegate, assignDelegate, unassignDelegate, toggleDelegateFlag, mergeDelegates, uploadDelegates, getAllRegistrations} from "../controllers/registeration.controller";
import { authenticateToken } from "../middleware/auth.middleware";

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types: CSV, XLS, XLSX
        const allowedMimeTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-office',
            'application/octet-stream'
        ];

        if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
        }
    }
});

const router = Router();

router.post("/event-registration-teacher/:userId", authenticateToken, eventRegistrationTeacher);
router.post("/event-registration-student/:userId", authenticateToken, eventRegistrationStudent);
router.get("/get-registrations/:eventId", authenticateToken, getRegistrations);
router.get("/get-all-registrations", authenticateToken, getAllRegistrations)

router.get("/get-registration-info-by-eventId-and-userId/:eventId/:userId", authenticateToken, getRegistrationsInfoByEventIdAndUserId);
router.delete("/delete-registration-by-registrationId/:registrationId", authenticateToken, deleteRegistration);
router.delete("/delete-delegate/:delegateId", authenticateToken, deleteDelegate);
router.post("/assign-delegate", authenticateToken, assignDelegate);
router.post("/unassign-delegate", authenticateToken, unassignDelegate);
router.post("/toggle-delegate-flag", authenticateToken, toggleDelegateFlag);
router.post("/merge-delegates", authenticateToken, mergeDelegates);
router.post("/upload-delegates", authenticateToken, upload.single('file'), uploadDelegates);

export default router;
