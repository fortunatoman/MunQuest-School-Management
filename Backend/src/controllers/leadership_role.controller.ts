import { Request, Response } from "express";
import { addLeadershipRoleService, getLeadershipRolesService, updateLeadershipRoleService, deleteLeadershipRoleService } from "../services/leadership_role.service";

export const getLeadershipRoles = async (req: Request, res: Response) => {
    try {
        const data = await getLeadershipRolesService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting leadership roles:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const addLeadershipRole = async (req: Request, res: Response) => {
    try {
        const { abbr, leadership_role } = req.body;
        const { userId } = req.user as any; // Get user ID from authenticated request
        
        console.log('🔍 Leadership role creation - User ID:', userId);
        console.log('🔍 Leadership role creation - Role:', abbr, leadership_role);
        
        const data = await addLeadershipRoleService(abbr, leadership_role);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            // Send Socket.IO notification to the user who created the role
            const io = (global as any).io;
            if (io) {
                const notificationData = {
                    message: `You have successfully created a new leadership role "${leadership_role}" (${abbr})!`,
                    eventName: 'Leadership Role Management',
                    eventDescription: `You have added a new leadership role "${leadership_role}" with abbreviation "${abbr}" to the system.`,
                    eventId: 'leadership-role-creation',
                    timestamp: new Date().toISOString(),
                    type: 'leadership_role_created',
                    targetUserId: userId
                };

                // Send to specific user's room
                io.to(`user_${userId}`).emit('leadership_role_created', notificationData);
                console.log(`✅ Sent leadership role creation notification to user ${userId}: ${notificationData.message}`);
            } else {
                console.log('❌ Socket.IO not available for leadership role notification');
            }

            return res.status(200).json({ 
                success: true, 
                message: data.message,
                notificationSent: !!io
            });
        }
    } catch (error) {
        console.log('Error adding leadership role:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateLeadershipRole = async (req: Request, res: Response) => {
    try {
        const { leadershipRoleId } = req.params;
        const { abbr, leadership_role } = req.body;
        const { userId } = req.user as any; // Get user ID from authenticated request
        
        const data = await updateLeadershipRoleService(leadershipRoleId, abbr, leadership_role);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            // Send Socket.IO notification to the user who updated the role
            const io = (global as any).io;
            if (io) {
                const notificationData = {
                    message: `You have successfully updated the leadership role "${leadership_role}" (${abbr})!`,
                    eventName: 'Leadership Role Management',
                    eventDescription: `You have updated the leadership role "${leadership_role}" with abbreviation "${abbr}" in the system.`,
                    eventId: 'leadership-role-update',
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
    } catch (error) {
        console.log('Error updating leadership role:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteLeadershipRole = async (req: Request, res: Response) => {
    try {
        const { leadershipRoleId } = req.params;
        const { userId } = req.user as any; // Get user ID from authenticated request
        
        const data = await deleteLeadershipRoleService(leadershipRoleId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            // Send Socket.IO notification to the user who deleted the role
            const io = (global as any).io;
            if (io) {
                const notificationData = {
                    message: `You have successfully deleted the leadership role!`,
                    eventName: 'Leadership Role Management',
                    eventDescription: `You have removed a leadership role from the system.`,
                    eventId: 'leadership-role-deletion',
                    timestamp: new Date().toISOString(),
                    type: 'leadership_role_deleted',
                    targetUserId: userId
                };

                // Send to specific user's room
                io.to(`user_${userId}`).emit('leadership_role_deleted', notificationData);
                console.log(`✅ Sent leadership role deletion notification to user ${userId}: ${notificationData.message}`);
            }

            return res.status(200).json({ 
                success: true, 
                message: data.message,
                notificationSent: !!io
            });
        }
    } catch (error) {
        console.log('Error deleting leadership role:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
