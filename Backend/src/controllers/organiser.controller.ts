import { Request, Response } from 'express';
import { organiserApprovalRequestService, uploadDocumentService, verifyOrganiserService, deleteOrganiserService, getAllOrganisersService, updateOrganiserStatusService, addOrganiserBySuperUserService, assignOrganiserToSchoolService, removeOrganiserFromSchoolService } from '../services/organiser.service';

export const organiserApprovalEvidenceUpload = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user as any;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Validate file type - Allowed: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG
        const allowedTypes = [
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

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG files are allowed.'
            });
        }

        // Validate file size (10MB limit for documents)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }

        // Upload document using the service
        const data = await uploadDocumentService(userId, req.file);

        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        } else {
            return res.status(200).json({
                success: true,
                message: data.message,
                documentUrl: data.documentUrl,
            });
        }
    } catch (error) {
        console.log('Error uploading evidence file:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const organiserApprovalRequest = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { school_id, locality_id, role, evidenceDocs } = req.body;
        const data = await organiserApprovalRequestService(userId, school_id, locality_id, role, evidenceDocs);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }
        return res.status(200).json({
            success: true,
            message: data.message
        });
    } catch (error) {
        console.log('Error requesting organiser approval:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const verifyOrganiser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params as any;
        const data = await verifyOrganiserService(userId);
        if (data.status === false) {
            return res.status(200).json({
                success: false,
                message: data.message
            });
        }
        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.data
        });
    } catch (error) {
        console.log('Error verifying organiser:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getAllOrganisers = async (req: Request, res: Response) => {
    try {
        const data = await getAllOrganisersService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, data: data.data });
        }
    }
    catch (error) {
        console.log('Error getting all organisers:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const updateOrganiserStatus = async (req: Request, res: Response) => {
    try {
        const { organiserId } = req.params;
        const { status, userId } = req.body;
        const data = await updateOrganiserStatusService(organiserId, status, userId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    }
    catch (error) {
        console.log('Error updating organiser status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteOrganiser = async (req: Request, res: Response) => {
    try {
        const { organiserId } = req.params;
        const data = await deleteOrganiserService(organiserId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    }
    catch (error) {
        console.log('Error deleting organiser:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const addOrganiserBySuperUser = async (req: Request, res: Response) => {
    try {
        const { user_id, school_id, locality_id, role, evidence, status, actioned_by_user_id } = req.body;
        const data = await addOrganiserBySuperUserService(
            user_id,
            role,
            school_id,
            locality_id,
            evidence,
            status,
            actioned_by_user_id
        );
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    }
    catch (error) {
        console.log('Error adding organiser by super user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const assignOrganiserToSchool = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const data = await assignOrganiserToSchoolService(userId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    }
    catch (error) {
        console.log('Error assigning organiser to school:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const removeOrganiserFromSchool = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const data = await removeOrganiserFromSchoolService(userId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    }
    catch (error) {
        console.log('Error removing organiser from school:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}