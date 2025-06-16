import { supabase } from "../utils/supabase";

export interface NotificationData {
    message: string;
    eventName: string;
    eventDescription?: string;
    startDate?: string;
    endDate?: string;
    eventId: string;
    timestamp: string;
    type: 'event_updated' | 'event_created' | 'event_deleted' | 'event_status_updated' | 'committee_created' | 'committee_updated' | 'committee_deleted' | 'agenda_created' | 'agenda_updated' | 'agenda_deleted';
}

export interface RegisteredUser {
    user_id: string;
    user: {
        id: string;
        fullname: string;
        email: string;
    };
}

/**
 * Get all registered users for a specific event
 */
export const getRegisteredUsersForEvent = async (eventId: string): Promise<RegisteredUser[]> => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                user_id,
                user:user_id(
                    id,
                    fullname,
                    email
                )
            `)
            .eq('event_id', eventId);

        if (error) {
            console.log('Error fetching registered users for event:', error);
            return [];
        }

        // Transform the data to match the RegisteredUser interface
        const transformedData: RegisteredUser[] = (data || []).map((item: any) => ({
            user_id: item.user_id,
            user: {
                id: item.user?.id || '',
                fullname: item.user?.fullname || '',
                email: item.user?.email || ''
            }
        }));

        return transformedData;
    } catch (error) {
        console.log('Error in getRegisteredUsersForEvent:', error);
        return [];
    }
};

/**
 * Send targeted notification to registered users of an event
 */
export const sendEventUpdateNotification = async (eventId: string, notificationData: NotificationData) => {
    try {
        // Get all registered users for this event
        const registeredUsers = await getRegisteredUsersForEvent(eventId);
        
        if (registeredUsers.length === 0) {
            console.log(`No registered users found for event ${eventId}`);
            return;
        }

        console.log(`Sending event update notification to ${registeredUsers.length} registered users for event ${eventId}`);

        // Get the broadcast function from global scope
        const broadcastNotification = (global as any).broadcastNotification;
        
        if (broadcastNotification) {
            // Send notification to each registered user
            for (const registeredUser of registeredUsers) {
                const userNotificationData = {
                    ...notificationData,
                    targetUserId: registeredUser.user_id,
                    targetUserEmail: registeredUser.user.email,
                    targetUserName: registeredUser.user.fullname
                };

                // Broadcast to specific user
                broadcastNotification('event_updated_for_registered_users', userNotificationData);
            }

            console.log(`✅ Successfully sent event update notifications to ${registeredUsers.length} registered users`);
        } else {
            console.log('❌ Broadcast function not available for event update notifications');
        }

        return {
            success: true,
            message: `Notifications sent to ${registeredUsers.length} registered users`,
            registeredUsersCount: registeredUsers.length
        };
    } catch (error) {
        console.log('Error sending event update notification:', error);
        return {
            success: false,
            message: 'Failed to send notifications',
            error: error
        };
    }
};

/**
 * Send general broadcast notification to all users
 */
export const sendGeneralBroadcastNotification = async (notificationData: NotificationData) => {
    try {
        const broadcastNotification = (global as any).broadcastNotification;
        
        if (broadcastNotification) {
            broadcastNotification(notificationData.type, notificationData);
            console.log(`✅ Successfully sent general broadcast notification: ${notificationData.message}`);
        } else {
            console.log('❌ Broadcast function not available for general notifications');
        }

        return {
            success: true,
            message: 'General notification sent successfully'
        };
    } catch (error) {
        console.log('Error sending general broadcast notification:', error);
        return {
            success: false,
            message: 'Failed to send general notification',
            error: error
        };
    }
};
