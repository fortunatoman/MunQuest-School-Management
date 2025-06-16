import { supabase } from "../utils/supabase";
import { makeUniqueName } from "../utils/uniqueNameGenerator";


// Event images upload service for PDFs and other documents
export const uploadEventImagesService = async (userId: string, file: Express.Multer.File) => {
    try {
        // Generate unique filename to avoid conflicts
        const filePath = makeUniqueName(file.originalname, userId);

        console.log("Event images filePath", filePath);

        // Upload file to Supabase storage (using 'events' bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('events')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true // Allow overwriting existing files
            });

        if (uploadError) {
            console.log("Upload error:", uploadError);
            return { status: false, message: 'Failed to upload event images to storage' };
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('events')
            .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        return {
            status: true,
            message: 'Event images uploaded successfully',
            imageUrl: imageUrl,
        };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to upload event images' };
    }
};

export const createEventService = async (name: string, cover_image: string, logo_image: string, school_id: string, locality_id: string, area_id: string, description: string, start_date: string, end_date: string, number_of_seats: string, fees_per_delegate: string, total_revenue: string, website: string, instagram: string, organiser_id: string) => {
    try {
        const { error } = await supabase
            .from('events')
            .insert({ organiser_id, name, description, cover_image, logo_image, school_id, locality_id, area_id, start_date, end_date, number_of_seats, fees_per_delegate, total_revenue, website, instagram });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to create event' };
        }
        return { status: true, message: 'Event created successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to create event' };
    }
};

export const getCurrentEventsService = async () => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*,locality:locality_id(*),school:school_id(*),organiser:organiser_id(*)')
            .eq('status', 'approved');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get current events' };
        }
        return { status: true, message: 'Current events fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get current events' };
    }
}

export const getCurrentEventsOfOrganiserService = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*,locality:locality_id(*),school:school_id(*),organiser:organiser_id(*)')
            .eq('organiser_id', userId)
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get current events of organiser' };
        }
        return { status: true, message: 'Current events of organiser fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get current events of organiser' };
    }
}

export const getEventByIdService = async (eventId: string) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*,locality:locality_id(*),school:school_id(*),organiser:organiser_id(*,user:userid(*))')
            .eq('id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get events by id' };
        }
        return { status: true, message: 'Events by id fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get events by id' };
    }
}


export const updateEventService = async (eventId: string,
    name: string,
    cover_image: string,
    school_id: string,
    locality_id: string,
    area_id: string,
    description: string,
    start_date: string,
    end_date: string,
    number_of_seats: string,
    fees_per_delegate: string,
    total_revenue: string,
    website: string,
    instagram: string) => {
    try {
        const { error } = await supabase
            .from('events')
            .update({ name, cover_image, school_id, locality_id, area_id, description, start_date, end_date, number_of_seats, fees_per_delegate, total_revenue, website, instagram })
            .eq('id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update event' };
        }
        return { status: true, message: 'Event updated successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update event' };
    }
}

export const getAllEventsService = async () => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*,locality:locality_id(*),school:school_id(*),organiser:organiser_id(*)');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get all events' };
        } else {
            return { status: true, data: data };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all events' };
    }
}

export const updateEventStatusService = async (eventId: string, status: string) => {
    try {
        const { error } = await supabase
            .from('events')
            .update({ status })
            .eq('id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update event status' };
        } else {
            return { status: true, message: 'Event status updated successfully' };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to update event status' };
    }
}

export const deleteEventService = async (eventId: string) => {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete event' };
        } else {
            return { status: true, message: 'Event deleted successfully' };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete event' };
    }
}