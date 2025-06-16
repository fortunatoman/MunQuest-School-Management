import { supabase } from "../utils/supabase";
import { uploadDocumentService } from "./organiser.service";

export const getGeneralDocumentService = async (eventId: string) => {
    try {
        const { data, error } = await supabase.from('documents').select('*').eq('event_id', eventId).eq("doc_type", "general");
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get general document' };
        }
        return { status: true, message: 'General document fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get general document' };
    }
}

export const uploadGeneralDocumentService = async (eventId: string, file: Express.Multer.File) => {
    try {
        const data = await uploadDocumentService(eventId, file);
        if (data.status === false) {
            return { status: false, message: data.message };
        }
        return { status: true, message: data.message, documentUrl: data.documentUrl };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to upload general document' };
    }
}

export const saveGeneralDocumentService = async (eventId: string, committeeId: string, doc_type: string, title: string, file_url: string) => {
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
            return { status: false, message: 'Failed to save general document' };
        }
        return { status: true, message: 'General document saved successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to save general document' };
    }
}

export const deleteGeneralDocumentService = async (id: string) => {
    try {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete general document' };
        }
        return { status: true, message: 'Document deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete document' };
    }
}

export const getGeneralDocumentByEventService = async (eventId: string) => {
    try {
        const { data, error } = await supabase.from('documents').select('*').eq('event_id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get general document by event' };
        }
        return { status: true, message: 'General document by event fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get general document by event' };
    }
}