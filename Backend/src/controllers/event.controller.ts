import { Request, Response } from 'express';
import { getAllEventsService, updateEventService, createEventService, uploadEventImagesService, getCurrentEventsService, getCurrentEventsOfOrganiserService, getEventByIdService, updateEventStatusService, deleteEventService } from '../services/event.service';
import { checkRegistrationStatusService } from '../services/registeration.service';
import { sendEventUpdateNotification, sendGeneralBroadcastNotification } from '../services/notification.service';
export const createEventImagesUpload = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user as any;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Validate file type (allow PDFs and common document formats)
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, and PNG files are allowed.'
            });
        }

        // Validate file size (10MB limit for documents)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }

        // Upload document using the service
        const data = await uploadEventImagesService(userId, req.file);

        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        } else {
            return res.status(200).json({
                success: true,
                message: data.message,
                imageUrl: data.imageUrl,
            });
        }
    } catch (error) {
        console.log('Error uploading event images:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            start_date,
            end_date,
            cover_image,
            logo_image,
            locality_id,
            school_id,
            area_id,
            number_of_seats,
            fees_per_delegate,
            total_revenue,
            website,
            instagram,
            organiser_id
        } = req.body;

        const data = await createEventService(name, cover_image, logo_image, school_id, locality_id, area_id, description, start_date, end_date, number_of_seats, fees_per_delegate, total_revenue, website, instagram, organiser_id);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        }

        // Send general broadcast notification for new event
        const notificationData = {
            message: `New event "${name}" has been created!`,
            eventName: name,
            eventDescription: description,
            startDate: start_date,
            endDate: end_date,
            eventId: 'unknown', // Event ID will be available after creation
            timestamp: new Date().toISOString(),
            type: 'event_created' as const
        };
        
        await sendGeneralBroadcastNotification(notificationData);

        return res.status(200).json({
            success: true,
            message: data.message
        });
    } catch (error) {
        console.log('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getCurrentEvents = async (req: Request, res: Response) => {
    try {
        const data = await getCurrentEventsService();
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
        console.log('Error getting current events:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getCurrentEventsOfOrganiser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params as any;
        const data = await getCurrentEventsOfOrganiserService(userId);
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
        console.log('Error getting current events:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getEventByIdService(eventId);
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
        console.log('Error getting events by id:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}


export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { name,
            description,
            start_date,
            end_date,
            cover_image,
            locality_id,
            school_id,
            area_id,
            number_of_seats,
            fees_per_delegate,
            total_revenue,
            website,
            instagram } = req.body;

        // Get event details before updating for notification
        const eventData = await getEventByIdService(eventId);
        if (eventData.status === false) {
            return res.status(400).json({ success: false, message: 'Event not found' });
        }
        
        const oldEventName = eventData.data?.[0]?.name || `Event ${eventId}`;

        const data = await updateEventService(eventId, name, cover_image, school_id, locality_id, area_id, description, start_date, end_date, number_of_seats, fees_per_delegate, total_revenue, website, instagram);
        if (data.status === false) {
            return res.status(400).json({
                success: false,
                message: data.message
            });
        } else {
            // Send targeted notification to registered users of this event
            const notificationData = {
                message: `Event "${name || oldEventName}" has been updated! Check the latest details.`,
                eventName: name || oldEventName,
                eventDescription: description,
                startDate: start_date,
                endDate: end_date,
                eventId: eventId,
                timestamp: new Date().toISOString(),
                type: 'event_updated' as const
            };

            // Send targeted notification to registered users only
            const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
            console.log('Event update notification result:', notificationResult);

            // Note: We only send targeted notifications to registered users for event updates
            // to prevent duplicate notifications. General broadcast is not needed for updates.
            
            return res.status(200).json({
                success: true,
                message: data.message,
                notificationSent: notificationResult?.success || false,
                registeredUsersNotified: notificationResult?.registeredUsersCount || 0
            });
        }
    }
    catch (error) {
        console.log('Error updating event:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const data = await getAllEventsService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, data: data.data });
        }
    }
    catch (error) {
        console.log('Error getting all events:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateEventStatus = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;
        
        // Get event details before updating for notification
        const eventData = await getEventByIdService(eventId);
        if (eventData.status === false) {
            return res.status(400).json({ success: false, message: 'Event not found' });
        }
        
        const eventName = eventData.data?.[0]?.name || `Event ${eventId}`;
        
        const data = await updateEventStatusService(eventId, status);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            // Send targeted notification to registered users when event status is updated
            let actionMessage = '';
            switch (status.toLowerCase()) {
                case 'approved':
                    actionMessage = `Event "${eventName}" has been approved! You can now register.`;
                    break;
                case 'flagged':
                    actionMessage = `Event "${eventName}" has been flagged for review.`;
                    break;
                case 'blocked':
                    actionMessage = `Event "${eventName}" has been blocked. Registration is not available.`;
                    break;
                default:
                    actionMessage = `Event "${eventName}" status updated to ${status}`;
            }
            
            const notificationData = {
                message: actionMessage,
                eventName: eventName,
                eventId: eventId,
                status: status,
                timestamp: new Date().toISOString(),
                type: 'event_status_updated' as const
            };

            // Send targeted notification to registered users
            const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
            console.log('Event status update notification result:', notificationResult);

            // Also send general broadcast
            await sendGeneralBroadcastNotification(notificationData);
            
            return res.status(200).json({ 
                success: true, 
                message: data.message,
                notificationSent: notificationResult?.success || false,
                registeredUsersNotified: notificationResult?.registeredUsersCount || 0
            });
        }
    }
    catch (error) {
        console.log('Error updating event status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        
        // Get event details before deleting for notification
        const eventData = await getEventByIdService(eventId);
        if (eventData.status === false) {
            return res.status(400).json({ success: false, message: 'Event not found' });
        }
        
        const eventName = eventData.data?.[0]?.name || `Event ${eventId}`;
        
        const data = await deleteEventService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            // Send targeted notification to registered users when event is deleted
            const notificationData = {
                message: `Event "${eventName}" has been cancelled. Your registration will be refunded.`,
                eventName: eventName,
                eventId: eventId,
                timestamp: new Date().toISOString(),
                type: 'event_deleted' as const
            };

            // Send targeted notification to registered users
            const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
            console.log('Event deletion notification result:', notificationResult);

            // Also send general broadcast
            await sendGeneralBroadcastNotification(notificationData);
            
            return res.status(200).json({ 
                success: true, 
                message: data.message,
                notificationSent: notificationResult?.success || false,
                registeredUsersNotified: notificationResult?.registeredUsersCount || 0
            });
        }
    }
    catch (error) {
        console.log('Error deleting event:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const checkRegistrationStatus = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const data = await checkRegistrationStatusService(userId);
        if (data.status === false) {
            return res.status(200).json({ success: false, message: data.message, data: null });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    }
    catch (error) {
        console.log('Error checking registration status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}