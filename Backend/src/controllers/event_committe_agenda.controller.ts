import { Request, Response } from "express";
import {
    deleteEventCommitteeAgendaService, getAllEventCommitteeAgendaService, saveEventCommitteeAgendaService,
    updateEventCommitteeAgendaService, uploadEventCommitteeAgendaDocumentService, getEventCommitteeAgendaDocumentService,
    saveEventCommitteeAgendaDocumentService,
    deleteEventCommitteeAgendaDocumentService
} from "../services/event_committe_agenda.service";
import { sendEventUpdateNotification } from "../services/notification.service";
import { supabase } from "../utils/supabase";

export const saveEventCommitteeAgenda = async (req: Request, res: Response) => {
    try {
        const {
            eventId,
            event_committeeId,
            agenda_abbr,
            agenda_title
        } = req.body;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        console.log('🔍 Agenda creation - Event ID:', eventId);
        console.log('🔍 Agenda creation - Committee ID:', event_committeeId);
        console.log('🔍 Agenda creation - Agenda:', agenda_abbr, agenda_title);
        
        const data = await saveEventCommitteeAgendaService(eventId, event_committeeId, agenda_abbr, agenda_title);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        const notificationData = {
            message: `New agenda item "${agenda_title}" has been added to the event!`,
            eventName: 'Committee Agenda Management',
            eventDescription: `A new agenda item "${agenda_title}" (${agenda_abbr}) has been added to the event. Check the agendas section for more details.`,
            eventId: eventId,
            timestamp: new Date().toISOString(),
            type: 'agenda_created' as const
        };

        // Send targeted notification to all registered users for this event
        const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
        console.log('Agenda creation notification result:', notificationResult);

        return res.status(200).json({ 
            success: true, 
            message: data.message, 
            data: data.data,
            notificationSent: notificationResult?.success || false,
            registeredUsersNotified: notificationResult?.registeredUsersCount || 0
        });
    }
    catch (error) {
        console.log('Error saving event committee agenda:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const getAllEventCommitteeAgenda = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const data = await getAllEventCommitteeAgendaService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data.data });
    }
    catch (error) {
        console.log('Error getting all event committee agenda:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const updateEventCommitteeAgenda = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { agenda_title, eventId } = req.body;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        console.log('🔍 Agenda update - Agenda ID:', id);
        console.log('🔍 Agenda update - Event ID:', eventId);
        console.log('🔍 Agenda update - New title:', agenda_title);
        
        const data = await updateEventCommitteeAgendaService(id, agenda_title);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        if (eventId) {
            const notificationData = {
                message: `An agenda item has been updated for the event!`,
                eventName: 'Committee Agenda Management',
                eventDescription: `An agenda item has been updated with new details. Check the agendas section for more information.`,
                eventId: eventId,
                timestamp: new Date().toISOString(),
                type: 'agenda_updated' as const
            };

            // Send targeted notification to all registered users for this event
            const notificationResult = await sendEventUpdateNotification(eventId, notificationData);
            console.log('Agenda update notification result:', notificationResult);

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
        console.log('Error updating event committee agenda:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteEventCommitteeAgenda = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.user as any; // Get current user ID from authenticated request
        
        // First get the agenda details to find the event ID before deleting
        const { data: agendaData, error: fetchError } = await supabase
            .from('agendas')
            .select('event_id, agenda_title, agenda_abbr')
            .eq('id', id)
            .single();
            
        if (fetchError) {
            console.log('Error fetching agenda details:', fetchError);
        }
        
        console.log('🔍 Agenda deletion - Agenda ID:', id);
        console.log('🔍 Agenda deletion - Event ID:', agendaData?.event_id);
        
        const data = await deleteEventCommitteeAgendaService(id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }

        // Send notification to all users registered for this event
        if (agendaData?.event_id) {
            const notificationData = {
                message: `An agenda item has been removed from the event!`,
                eventName: 'Committee Agenda Management',
                eventDescription: `An agenda item has been removed from the event. Check the agendas section for updated information.`,
                eventId: agendaData.event_id,
                timestamp: new Date().toISOString(),
                type: 'agenda_deleted' as const
            };

            // Send targeted notification to all registered users for this event
            const notificationResult = await sendEventUpdateNotification(agendaData.event_id, notificationData);
            console.log('Agenda deletion notification result:', notificationResult);

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
        console.log('Error deleting event committee agenda:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}



export const getEventCommitteeAgendaDocument = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        console.log("eventId", eventId);
        const data = await getEventCommitteeAgendaDocumentService(eventId);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data });
    }
    catch (error) {
        console.log('Error getting event committee agenda document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const uploadEventCommitteeAgendaDocument = async (req: Request, res: Response) => {
    try {
        const { eventId, committeeId } = req.body;
        const file = req.file as Express.Multer.File;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please provide a file.'
            });
        }

        // Validate file type - Allowed: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG, JPG files are allowed.'
            });
        }

        const data = await uploadEventCommitteeAgendaDocumentService(eventId, committeeId, file);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, documentUrl: data.documentUrl });
    }
    catch (error) {
        console.log('Error uploading event committee agenda document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const saveEventCommitteeAgendaDocument = async (req: Request, res: Response) => {
    try {
        const {
            eventId,
            committeeId,
            doc_type,
            title,
            file_url } = req.body;
        
        const data = await saveEventCommitteeAgendaDocumentService(eventId, committeeId, doc_type, title, file_url);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message, data: data.data });
    }
    catch (error) {
        console.log('Error saving event committee agenda document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export const deleteEventCommitteeAgendaDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await deleteEventCommitteeAgendaDocumentService(id);
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        }
        return res.status(200).json({ success: true, message: data.message });
    }
    catch (error) {
        console.log('Error deleting event committee agenda document:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}