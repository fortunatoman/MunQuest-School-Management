import { Request, Response } from "express";
import {
    eventRegistrationTeacherService, eventRegistrationStudentService, getRegistrationsService,
    getRegistrationsInfoByEventIdAndUserIdService, deleteRegistrationService, deleteDelegateService,
    assignDelegateService, unassignDelegateService, toggleDelegateFlagService, mergeDelegatesService, uploadDelegatesService, getAllRegistrationsService
} from "../services/registeration.service";
import {
    deleteLeadershipRoleByEventService, saveLeadershipRoleByEventService,
    updateLeadershipRoleByEventService, updateLeadershipRoleRankingByEventService,
} from "../services/event_leader.service";
import { supabase } from "../utils/supabase";

export const getRegistrations = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getRegistrationsService(eventId);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }
        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.data
        });
    }
    catch (error) {
        console.log('Error getting registrations:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getAllRegistrations = async (req: Request, res: Response) => {
    try {
        const data = await getAllRegistrationsService();
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            })
        }
        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.data
        })
    } catch (error) {
        console.log('Error getting all registrations:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const eventRegistrationTeacher = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { eventId, foodPreference, foodAllergies } = req.body;
        const data = await eventRegistrationTeacherService(eventId, userId, foodPreference, foodAllergies);
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
        const {
            eventId,
            mun_experience,
            pref_committee_1_id,
            pref_committee_2_id,
            pref_committee_3_id,
            food_pref,
            food_allergies,
            emergency_name,
            emergency_phone
        } = req.body;

        const data = await eventRegistrationStudentService(eventId, userId, mun_experience, pref_committee_1_id, pref_committee_2_id, pref_committee_3_id, food_pref, food_allergies, emergency_name, emergency_phone);
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

export const saveLeadershipRoleByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId, roleId, userId } = req.body;
        const { userId: currentUserId } = req.user as any; // Get current user ID from authenticated request

        console.log('🔍 Leadership role assignment - Event ID:', eventId);
        console.log('🔍 Leadership role assignment - Role ID:', roleId);
        console.log('🔍 Leadership role assignment - Target User ID:', userId);
        console.log('🔍 Leadership role assignment - Current User ID:', currentUserId);

        const data = await saveLeadershipRoleByEventService(eventId, roleId, userId);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }

        // Send Socket.IO notification to the user who was assigned the leadership role
        const io = (global as any).io;
        if (io) {
            const notificationData = {
                message: `You have been assigned a leadership role for an event!`,
                eventName: 'Leadership Role Assignment',
                eventDescription: `You have been assigned a leadership role for an event. Check your event details for more information.`,
                eventId: eventId,
                timestamp: new Date().toISOString(),
                type: 'leadership_role_assigned',
                targetUserId: userId
            };

            // Send to specific user's room
            io.to(`user_${userId}`).emit('leadership_role_assigned', notificationData);
            console.log(`✅ Sent leadership role assignment notification to user ${userId}: ${notificationData.message}`);
        } else {
            console.log('❌ Socket.IO not available for leadership role assignment notification');
        }

        return res.status(200).json({
            success: true,
            message: data.message,
            notificationSent: !!io
        });
    }
    catch (error) {
        console.log('Error saving leadership role by event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const updateLeadershipRoleByEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { eventId, roleId, userId } = req.body;
        const { userId: currentUserId } = req.user as any; // Get current user ID from authenticated request

        console.log('🔍 Leadership role update - Event ID:', eventId);
        console.log('🔍 Leadership role update - Role ID:', roleId);
        console.log('🔍 Leadership role update - Target User ID:', userId);

        const data = await updateLeadershipRoleByEventService(id, eventId, roleId, userId);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }

        // Send Socket.IO notification to the user whose leadership role was updated
        const io = (global as any).io;
        if (io) {
            const notificationData = {
                message: `Your leadership role for an event has been updated!`,
                eventName: 'Leadership Role Update',
                eventDescription: `Your leadership role assignment for an event has been updated. Check your event details for more information.`,
                eventId: eventId,
                timestamp: new Date().toISOString(),
                type: 'leadership_role_updated',
                targetUserId: userId
            };

            // Send to specific user's room
            io.to(`user_${userId}`).emit('leadership_role_updated', notificationData);
            console.log(`✅ Sent leadership role update notification to user ${userId}: ${notificationData.message}`);
        }

        return res.status(200).json({
            success: true,
            message: data.message,
            notificationSent: !!io
        });
    }
    catch (error) {
        console.log('Error updating leadership role by event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const deleteLeadershipRoleByEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId: currentUserId } = req.user as any; // Get current user ID from authenticated request

        // First get the leadership role details to find the user who was assigned
        // We need to get the userId from the event_leaders table before deleting
        const { data: leadershipRoleData, error: fetchError } = await supabase
            .from('event_leaders')
            .select('userid, eventid')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.log('Error fetching leadership role details:', fetchError);
        }

        const data = await deleteLeadershipRoleByEventService(id);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }

        // Send Socket.IO notification to the user whose leadership role was removed
        const io = (global as any).io;
        if (io && leadershipRoleData?.userid) {
            const notificationData = {
                message: `Your leadership role for an event has been removed!`,
                eventName: 'Leadership Role Removal',
                eventDescription: `Your leadership role assignment for an event has been removed.`,
                eventId: leadershipRoleData.eventid,
                timestamp: new Date().toISOString(),
                type: 'leadership_role_removed',
                targetUserId: leadershipRoleData.userid
            };

            // Send to specific user's room
            io.to(`user_${leadershipRoleData.userid}`).emit('leadership_role_removed', notificationData);
            console.log(`✅ Sent leadership role removal notification to user ${leadershipRoleData.userid}: ${notificationData.message}`);
        }

        return res.status(200).json({
            success: true,
            message: data.message,
            notificationSent: !!(io && leadershipRoleData?.userid)
        });
    }
    catch (error) {
        console.log('Error deleting leadership role by event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const updateLeadershipRoleRankingByEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { direction } = req.body;
        const data = await updateLeadershipRoleRankingByEventService(id, direction);
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
        console.log('Error updating leadership role ranking by event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getRegistrationsInfoByEventIdAndUserId = async (req: Request, res: Response) => {
    try {
        const { eventId, userId } = req.params;
        const data = await getRegistrationsInfoByEventIdAndUserIdService(eventId, userId);
        if (data.status === false) {
            return res.status(400).json({
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
        console.log('Error getting registrations info by event id and user id:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const deleteRegistration = async (req: Request, res: Response) => {
    try {
        const { registrationId } = req.params;
        const data = await deleteRegistrationService(registrationId);
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
        console.log('Error deleting registration:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const deleteDelegate = async (req: Request, res: Response) => {
    try {
        const { delegateId } = req.params;
        const data = await deleteDelegateService(delegateId);
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
        console.log('Error deleting delegate:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const assignDelegate = async (req: Request, res: Response) => {
    try {
        const { delegateId, committeeId, countryId } = req.body;
        if (!delegateId) {
            return res.status(400).json({
                success: false,
                message: 'Delegate ID are required'
            });
        }

        const data = await assignDelegateService(delegateId, committeeId, countryId);

        if (!data.status) {
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
        console.log('Error assigning delegate:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const unassignDelegate = async (req: Request, res: Response) => {
    try {
        const { delegateId } = req.body;
        if (!delegateId) {
            return res.status(400).json({
                success: false,
                message: 'Delegate ID is required'
            });
        }

        const data = await unassignDelegateService(delegateId);

        if (!data.status) {
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
        console.log('Error unassigning delegate:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Toggle delegate flag
export const toggleDelegateFlag = async (req: Request, res: Response) => {
    try {
        const { delegateId, flag } = req.body;

        if (!delegateId || typeof flag !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Delegate ID and flag status are required'
            });
        }

        const data = await toggleDelegateFlagService(delegateId, flag);

        if (!data.status) {
            return res.status(400).json({
                success: false,
                error: data.message
            });
        }

        res.status(200).json({
            success: true,
            message: data.message
        });
    }
    catch (error) {
        console.log('Error toggling delegate flag:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Merge delegates
export const mergeDelegates = async (req: Request, res: Response) => {
    try {
        const { selectedDelegates } = req.body;

        if (!selectedDelegates || !Array.isArray(selectedDelegates) || selectedDelegates.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'At least two delegates are required for merging'
            });
        }

        const data = await mergeDelegatesService(selectedDelegates);

        if (!data.status) {
            return res.status(400).json({
                success: false,
                error: data.message
            });
        }

        res.status(200).json({
            success: true,
            message: data.message
        });
    }
    catch (error) {
        console.log('Error merging delegates:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const uploadDelegates = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const eventId = req.body.eventId;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        const data = await uploadDelegatesService(file, eventId);

        if (!data.status) {
            return res.status(400).json({
                success: false,
                message: data.message,
                data: {
                    linked: data.linked || 0,
                    created: data.created || 0,
                    needsReview: data.needsReview || 0,
                    errors: data.errors || []
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: data.message,
            data: {
                linked: data.linked || 0,
                created: data.created || 0,
                needsReview: data.needsReview || 0,
                errors: data.errors || []
            }
        });
    } catch (error) {
        console.log('Error uploading delegates:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}