import { supabase } from "../utils/supabase";
import { uploadDocumentService } from "./organiser.service";

export const saveEventCommitteeAgendaService = async (eventId: string, committeeId: string, agenda_abbr: string, agenda_title: string) => {
    try {
        const { data, error } = await supabase.from('agendas')
            .insert({
                eventid: eventId,
                event_committee_id: committeeId,
                agenda_abbr: agenda_abbr,
                agenda_title: agenda_title,
            })
            .select();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to save event committee agenda' };
        }
        return { status: true, message: 'Event committee agenda saved successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to save event committee agenda' };
    }
}

export const getAllEventCommitteeAgendaService = async (eventId: string) => {
    try {
        const { data, error } = await supabase.from('agendas').select('*')
            .eq('eventid', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get all event committee agenda' };
        }
        return { status: true, message: 'Event committee agenda fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all event committee agenda' };
    }
}

export const updateEventCommitteeAgendaService = async (id: string, agenda_title: string) => {
    try {
        const { data, error } = await supabase.from('agendas').update({ agenda_title }).eq('id', id).select();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update event committee agenda' };
        } else {
            return { status: true, message: 'Event committee agenda updated successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update event committee agenda' };
    }
}

export const deleteEventCommitteeAgendaService = async (id: string) => {
    try {
        const { data, error } = await supabase.from('agendas').delete().eq('id', id).select();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete event committee agenda' };
        } else {
            return { status: true, message: 'Event committee agenda deleted successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete event committee agenda' };
    }
}



export const getEventCommitteeAgendaDocumentService = async (eventId: string) => {
    try {
        const { data, error } = await supabase.from('documents').select('*').eq('event_id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get event committee agenda document' };
        }
        return { status: true, message: 'Event committee agenda document fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get event committee agenda document' };
    }
}

export const uploadEventCommitteeAgendaDocumentService = async (eventId: string, committeeId: string, file: Express.Multer.File) => {
    try {
        const data = await uploadDocumentService(eventId, file);
        if (data.status === false) {
            return { status: false, message: data.message };
        }
        return { status: true, message: data.message, documentUrl: data.documentUrl };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to upload document' };
    }
}

export const saveEventCommitteeAgendaDocumentService = async (eventId: string, committeeId: string, doc_type: string, title: string, file_url: string) => {
    try {
        const { data, error } = await supabase.from('documents')
            .insert({
                event_id: eventId,
                event_committee_id: committeeId,
                file_url: file_url,
                doc_type: doc_type,
                title: title,
            })
            .select();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to save document' };
        }
        return { status: true, message: 'Document saved successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to save document' };
    }
}

export const deleteEventCommitteeAgendaDocumentService = async (id: string) => {
    try {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete document' };
        }
        return { status: true, message: 'Document deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete document' };
    }
}