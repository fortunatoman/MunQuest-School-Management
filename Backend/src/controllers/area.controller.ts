import { Request, Response } from "express";
import { getAreasService, deleteAreaService, updateAreaService, createAreaService, updateAreaStatusService } from "../services/area.service";

export const getAreas = async (req: Request, res: Response) => {
    try {
        const data = await getAreasService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting areas:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const createArea = async (req: Request, res: Response) => {
    try {
        const { locality_id, name, code } = req.body;
        const data = await createAreaService(locality_id, name, code);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error creating area:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteArea = async (req: Request, res: Response) => {
    try {
        const { areaId } = req.params;
        const data = await deleteAreaService(areaId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error deleting area:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateArea = async (req: Request, res: Response) => {
    try {
        const { areaId } = req.params;
        const { name, code } = req.body;
        const data = await updateAreaService(areaId, name, code);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating area:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateAreaStatus = async (req: Request, res: Response) => {
    try {
        const { areaId } = req.params;
        const { status } = req.body;
        const data = await updateAreaStatusService(areaId, status);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating area status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}