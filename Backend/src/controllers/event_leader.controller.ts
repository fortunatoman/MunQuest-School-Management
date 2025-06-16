import { Request, Response } from "express";
import { deleteLeadershipRoleService } from "../services/leadership_role.service";
import { getEventLeadersService } from "../services/event_leader.service";


export const eventLeadershipRoleDelete = async (req: Request, res: Response) => {
    try {
        const { leadershipRoleId } = req.body;
        const data = await deleteLeadershipRoleService(leadershipRoleId);
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
    }
    catch (error) {
        console.log('Error registering for event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const eventRegistrationStudent = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { eventId, munExperience, preferredCommittee1, foodPreference, foodAllergies, emergencyContactName, emergencyMobileNumber, } = req.body;
    //     const data = await eventLeadershipRoleDeleteService(eventId, userId, munExperience, preferredCommittee1, foodPreference, foodAllergies, emergencyContactName, emergencyMobileNumber);
    //     if (data.status === false) {
    //         return res.status(400).json({
    //             success: false,
    //             message: data.message
    //         });
    //     }
    //     return res.status(200).json({
    //         success: true,
    //         message: data.message
    //     });
    }
    catch (error) {
        console.log('Error registering for event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getEventLeaders = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getEventLeadersService(eventId);
        
        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.data
        });
    }
    catch (error) {
        console.log('Error getting event leaders:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}