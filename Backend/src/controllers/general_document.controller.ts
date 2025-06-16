import { Request, Response } from "express";
import {
    saveGeneralDocumentService,
    deleteGeneralDocumentService,
    uploadGeneralDocumentService,
    getGeneralDocumentByEventService
} from "../services/general_document.service";
import { getGeneralDocumentService } from "../services/general_document.service";

export const getGeneralDocument = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getGeneralDocumentService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data });
    }
    catch (error) {
        console.log('Error getting general document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const uploadGeneralDocument = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.body;
        const file = req.file as Express.Multer.File;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please provide a file.'
            });
        }

        // Validate file type - Allowed: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG
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

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG files are allowed.'
            });
        }

        const data = await uploadGeneralDocumentService(eventId, file);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, documentUrl: data.documentUrl });
    }
    catch (error) {
        console.log('Error uploading general document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const saveGeneralDocument = async (req: Request, res: Response) => {
    try {
        const {
            eventId,
            committeeId,
            doc_type,
            title,
            file_url } = req.body;

        const data = await saveGeneralDocumentService(eventId, committeeId, doc_type, title, file_url);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data.data });
    }
    catch (error) {
        console.log('Error saving general document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteGeneralDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await deleteGeneralDocumentService(id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message });
    }
    catch (error) {
        console.log('Error deleting general document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const getGeneralDocumentByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getGeneralDocumentByEventService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data.data });
    }
    catch (error) {
        console.log('Error getting general document by event:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
