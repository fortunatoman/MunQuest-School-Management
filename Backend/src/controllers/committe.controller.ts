import { Request, Response } from "express";
import { addCommitteeService, getCommitteesService, updateCommitteeService, deleteCommitteeService } from "../services/committe.service";

export const getCommittees = async (req: Request, res: Response) => {
    try {
        const data = await getCommitteesService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting committees:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const addCommittee = async (req: Request, res: Response) => {
    try {
        const { abbr, committee , category} = req.body;
        const data = await addCommitteeService(abbr, committee, category);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error adding committee:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateCommittee = async (req: Request, res: Response) => {
    try {
        const { committeeId } = req.params;
        const { abbr, committee, category } = req.body;
        const data = await updateCommitteeService(committeeId, abbr, committee, category);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error updating committee:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteCommittee = async (req: Request, res: Response) => {
    try {
        const { committeeId } = req.params;
        const data = await deleteCommitteeService(committeeId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message });
        }
    } catch (error) {
        console.log('Error deleting committee:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
