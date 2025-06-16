import { Request, Response } from "express";
import { getLocalitiesService, updateLocalityService, deleteLocalityService, mergeLocalityService } from "../services/locality.service";

export const getLocalities = async (req: Request, res: Response) => {
    try {
        const data = await getLocalitiesService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting localities:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateLocality = async (req: Request, res: Response) => {
    try {
        const { localityId } = req.params;
        const { name, code } = req.body;
        const data = await updateLocalityService(localityId, name, code);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating locality:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteLocality = async (req: Request, res: Response) => {
    try {
        const { localityId } = req.params;
        const data = await deleteLocalityService(localityId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error deleting locality:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const mergeLocality = async (req: Request, res: Response) => {
    try {
        const { localityId } = req.body;
        const data = await mergeLocalityService(localityId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data || null });
        }
    } catch (error) {
        console.log('Error merging locality:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
