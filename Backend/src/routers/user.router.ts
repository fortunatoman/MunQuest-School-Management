import { Router } from "express";
import multer from "multer";
import {
    getUserById,
    register,
    login,
    teacherProfileUpdate,
    studentProfileUpdate,
    userStudentProfileUpdate,
    userTeacherProfileUpdate,
    changePassword,
    uploadAvatar,
    profileDelete,
    getAllUsers,
    getUserIdByGmail,
    updateUserStatus,
    userTeacherProfileAndCustomLocalityUpdate,
    userTeacherProfileAndCustomSchoolNameUpdate,
    userStudentProfileAndCustomSchoolNameUpdate,
    userStudentProfileAndCustomLocalityUpdate,
    updateUserGolbalStatus,
    removeUserGolbalStatus,
    updateUserBySuperUser,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
        }
    }
});

const router = Router();

// Authentication routes (public)   
router.post("/register", register);     // POST /api/v1/users/register
router.post("/login", login);
router.post("/get-userid-by-email", getUserIdByGmail);
router.delete("/delete-account/:userId", authenticateToken, profileDelete);
router.patch("/teacher-profile/:userId", authenticateToken, teacherProfileUpdate);
router.patch("/student-profile/:userId", authenticateToken, studentProfileUpdate);

router.get("/user-profile/:userId", authenticateToken, getUserById);
// Multer error handling middleware
const handleMulterError = (error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    } else if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
};

router.post("/upload-avatar/:userId", authenticateToken, upload.single('avatar'), handleMulterError, uploadAvatar);
router.patch("/student-profile-update/:userId", authenticateToken, userStudentProfileUpdate);
router.patch("/teacher-profile-update/:userId", authenticateToken, userTeacherProfileUpdate);
router.patch("/teacher-profile-and-custom-locality/:userId", authenticateToken, userTeacherProfileAndCustomLocalityUpdate);
router.patch("/teacher-profile-custom-school-name/:userId", authenticateToken, userTeacherProfileAndCustomSchoolNameUpdate);
router.patch("/student-profile-custom-school-name/:userId", authenticateToken, userStudentProfileAndCustomSchoolNameUpdate);
router.patch("/student-profile-and-custom-locality/:userId", authenticateToken, userStudentProfileAndCustomLocalityUpdate);
router.patch("/send-superuser-invite", authenticateToken, updateUserGolbalStatus);
router.patch("/remove-superuser-invite", authenticateToken, removeUserGolbalStatus);


router.patch("/change-password/:userId", authenticateToken, changePassword);

router.get("/all-users", authenticateToken, getAllUsers);
router.patch("/update-user-status/:userId", authenticateToken, updateUserStatus);
router.delete("/delete-user-by-super-user/:userId", authenticateToken, profileDelete);
router.patch("/update-user-by-super-user/:userId", authenticateToken, updateUserBySuperUser);
export default router;
