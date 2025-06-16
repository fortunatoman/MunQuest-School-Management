import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.middleware";
import { organiserApprovalEvidenceUpload, organiserApprovalRequest, verifyOrganiser, getAllOrganisers, updateOrganiserStatus, deleteOrganiser, addOrganiserBySuperUser, assignOrganiserToSchool, removeOrganiserFromSchool } from "../controllers/organiser.controller";

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

const router = Router();

router.post("/organiser-approval-edvince-upload", authenticateToken, upload.single('file'), organiserApprovalEvidenceUpload);
router.post("/organiser-approval-request/:userId", authenticateToken, organiserApprovalRequest);
router.get("/verify-organiser/:userId", authenticateToken, verifyOrganiser);
router.get("/all-organisers", authenticateToken, getAllOrganisers);
router.patch("/update-organiser-status/:organiserId", authenticateToken, updateOrganiserStatus);
router.delete("/delete-organiser/:organiserId", authenticateToken, deleteOrganiser);
router.post("/add-organiser-by-super-user", authenticateToken, addOrganiserBySuperUser);
router.post("/assign-organiser-to-school", authenticateToken, assignOrganiserToSchool);
router.delete("/remove-organiser-from-school/:userId", authenticateToken, removeOrganiserFromSchool);


export default router;
