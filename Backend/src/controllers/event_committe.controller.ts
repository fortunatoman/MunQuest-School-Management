import { Request, Response } from "express";
import { eventRegistrationTeacherService, eventRegistrationStudentService } from "../services/registeration.service";
import {
    getAllEventCommitteesService, saveEventCommitteeService, updateEventCommitteeByEventService,
    deleteEventCommitteeService
} from "../services/event_committe.service";
import { sendEventUpdateNotification } from "../services/notification.service";
import { supabase } from "../utils/supabase";

// export const eventRegistrationTeacher = async (req: Request, res: Response) => {
//     try {
//         const { userId } = req.params;
//         const { eventId, foodPreference, foodAllergies } = req.body;
//         const data = await eventRegistrationTeacherService(eventId, userId, foodPreference, foodAllergies);
//         if (data.status === false) {
//             return res.status(400).json({
//                 success: false,
//                 message: data.message
//             });
//         }
//         return res.status(200).json({
//             success: true,
//             message: data.message
//         });
//     }
//     catch (error) {
//         console.log('Error registering for event:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Internal server error'
//         });
//     }
// }

// export const eventRegistrationStudent = async (req: Request, res: Response) => {
//     try {
//         const { userId } = req.params;
//         const { eventId, munExperience, preferredCommittee1, foodPreference, foodAllergies, emergencyContactName, emergencyMobileNumber, } = req.body;
//         const data = await eventRegistrationStudentService(eventId, userId, munExperience, preferredCommittee1, foodPreference, foodAllergies, emergencyContactName, emergencyMobileNumber);
//         if (data.status === false) {
//             return res.status(400).json({
//                 success: false,
//                 message: data.message
//             });
//         }
//         return res.status(200).json({
//             success: true,
//             message: data.message
//         });
//     }
//     catch (error) {
//         console.log('Error registering for event:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Internal server error'
//         });
//     }
// }

export const getAllEventCommittees = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getAllEventCommitteesService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data.data });
    }
    catch (error) {
        console.log('Error getting all event committees:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const saveEventCommittee = async (req: Request, res: Response) => {
    try {
        const {
            committeeId,
            eventId,
            category,
            abbr,
            seats,
            chair_username,
            chair_fullname,
            deputy_chair1_username,
            deputy_chair1_fullname,
            deputy_chair2_username,
            deputy_chair2_fullname } = req.body;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        console.log('🔍 Committee creation - Event ID:', eventId);
        console.log('🔍 Committee creation - Committee:', abbr, category);
        console.log('🔍 Committee creation - Seats:', seats);
        
        const data = await saveEventCommitteeService(eventId, committeeId, category, abbr, seats, chair_username, chair_fullname, deputy_chair1_username, deputy_chair1_fullname, deputy_chair2_username, deputy_chair2_fullname);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        const notificationData = {
            message: `New committee "${abbr}" (${category}) has been added to the event!`,
            eventName: 'Committee Management',
            eventDescription: `A new committee "${abbr}" with ${seats} seats has been added to the event. Check the committees section for more details.`,
            eventId: eventId,
            timestamp: new Date().toISOString(),
            type: 'committee_created' as const
        };

        // Send targeted notification to all registered users for this event
        const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
        console.log('Committee creation notification result:', notificationResult);

        return res.status(200).json({ 
            success: true, 
            message: data.message, 
            data: data.data,
            notificationSent: notificationResult?.success || false,
            registeredUsersNotified: notificationResult?.registeredUsersCount || 0
        });
    }
    catch (error) {
        console.log('Error saving event committee:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateEventCommitteeByEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            committeeId,
            eventId,
            category,
            seats,
            chair_username,
            chair_fullname,
            deputy_chair1_username,
            deputy_chair1_fullname,
            deputy_chair2_username,
            deputy_chair2_fullname
        } = req.body;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        console.log('🔍 Committee update - Event ID:', eventId);
        console.log('🔍 Committee update - Committee ID:', committeeId);
        console.log('🔍 Committee update - Seats:', seats);
        
        const data = await updateEventCommitteeByEventService(id, committeeId, eventId, category, seats, chair_username, chair_fullname, deputy_chair1_username, deputy_chair1_fullname, deputy_chair2_username, deputy_chair2_fullname);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        const notificationData = {
            message: `Committee details have been updated for the event!`,
            eventName: 'Committee Management',
            eventDescription: `A committee has been updated with new details. Check the committees section for more information.`,
            eventId: eventId,
            timestamp: new Date().toISOString(),
            type: 'committee_updated' as const
        };

        // Send targeted notification to all registered users for this event
        const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
        console.log('Committee update notification result:', notificationResult);

        return res.status(200).json({ 
            success: true, 
            message: data.message,
            notificationSent: notificationResult?.success || false,
            registeredUsersNotified: notificationResult?.registeredUsersCount || 0
        });
    }
    catch (error) {
        console.log('Error updating event committee by event:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteEventCommittee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        // First get the committee details to find the event ID before deleting
        const { data: committeeData, error: fetchError } = await supabase
            .from('event_committee')
            .select('event_id, abbr, category')
            .eq('id', id)
            .single();
            
        if (fetchError) {
            console.log('Error fetching committee details:', fetchError);
        }
        
        console.log('🔍 Committee deletion - Committee ID:', id);
        console.log('🔍 Committee deletion - Event ID:', committeeData?.event_id);
        
        const data = await deleteEventCommitteeService(id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        if (committeeData?.event_id) {
            const notificationData = {
                message: `A committee has been removed from the event!`,
                eventName: 'Committee Management',
                eventDescription: `A committee has been removed from the event. Check the committees section for updated information.`,
                eventId: committeeData.event_id,
                timestamp: new Date().toISOString(),
                type: 'committee_deleted' as const
            };

            // Send targeted notification to all registered users for this event
            const notificationResult = await sendEventUpdateNotification(committeeData.event_id, notificationData);
            console.log('Committee deletion notification result:', notificationResult);

            return res.status(200).json({ 
                success: true, 
                message: data.message,
                notificationSent: notificationResult?.success || false,
                registeredUsersNotified: notificationResult?.registeredUsersCount || 0
            });
        }

        return res.status(200).json({ success: true, message: data.message });
    }
    catch (error) {
        console.log('Error deleting event committee:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}