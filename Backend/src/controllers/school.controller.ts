import { Request, Response } from "express";
import { getSchoolsService, updateSchoolStatusService, deleteSchoolService, updateSchoolService, mergeShoolsService } from "../services/school.service";
import { createSchoolService } from "../services/school.service";

export const getSchools = async (req: Request, res: Response) => {
    try {
        const data = await getSchoolsService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting schools:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const createSchool = async (req: Request, res: Response) => {
    try {
        const { code, name, locality_id, area_id } = req.body;
        if (!code || !name || !locality_id || !area_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: code, name, locality_id, area_id'
            });
        }

        // Trim whitespace and validate string fields
        const trimmedCode = code.toString().trim();
        const trimmedName = name.toString().trim();

        if (trimmedCode.length === 0 || trimmedName.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Code and name cannot be empty'
            });
        }

        const data = await createSchoolService(trimmedCode, trimmedName, locality_id, area_id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(201).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error creating school:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateSchool = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { code, name, locality_id, area_id } = req.body;
        console.log("schoolId, code, name, locality_id, area_id", schoolId, code, name, locality_id, area_id);
        const data = await updateSchoolService(schoolId, code, name, locality_id, area_id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating school:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateSchoolStatus = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { status } = req.body;
        console.log("schoolId, status", schoolId, status);
        const data = await updateSchoolStatusService(schoolId, status);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating school status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteSchool = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const data = await deleteSchoolService(schoolId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error deleting school:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const mergeShools = async (req: Request, res: Response) => {
    try {
        const { primaryLocalityId, secondaryLocalityId } = req.body;
        const data = await mergeShoolsService(primaryLocalityId, secondaryLocalityId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error merging schools:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}