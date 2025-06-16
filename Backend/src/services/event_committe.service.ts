import { supabase } from "../utils/supabase";

export const getAllEventCommitteesService = async (eventId: string) => {
    try {
        const { data, error } = await supabase
            .from('event_committee')
            .select('*,committee:committee_id(*),event:event_id(*)')
            .eq('event_id', eventId)
            .order('ranking', { ascending: true });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get all event committees' };
        }
        return { status: true, message: 'All event committees fetched successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all event committees' };
    }
}

export const saveEventCommitteeService = async (eventId: string, committeeId: string,category: string, abbr: string, seats: string, chair_username: string, chair_fullname: string, deputy_chair1_username: string, deputy_chair1_fullname: string, deputy_chair2_username: string, deputy_chair2_fullname: string) => {
    try {
        const { count, error: countError } = await supabase
            .from('event_committee')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId);

        if (countError) {
            console.log("error getting event committee count", countError);
        }

        const nextRank = (count || 0) + 1;

        const { data, error } = await supabase.from('event_committee')
            .insert({
                event_id: eventId,
                committee_id: committeeId,
                category: category,
                abbr: abbr,
                seats: seats,
                chair_username: chair_username,
                chair_name: chair_fullname,
                deputy_chair_1_username: deputy_chair1_username,
                deputy_chair_1_name: deputy_chair1_fullname,
                deputy_chair_2_username: deputy_chair2_username,
                deputy_chair_2_name: deputy_chair2_fullname,
                ranking: nextRank
            })
            .select();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to save event committee' };
        }
        return { status: true, message: 'Event committee saved successfully', data: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to save event committee' };
    }
}

export const updateEventCommitteeByEventService = async (id: string, committeeId: string, eventId: string, category: string, seats: string, chair_username: string, chair_fullname: string, deputy_chair1_username: string, deputy_chair1_fullname: string, deputy_chair2_username: string, deputy_chair2_fullname: string) => {
    try {

        // Update current committee ranking
        const { error: updateCurrentError } = await supabase
            .from('event_committee')
            .update({ committee_id: committeeId, event_id: eventId, category: category, seats: seats, chair_username: chair_username, chair_name: chair_fullname, deputy_chair_1_username: deputy_chair1_username, deputy_chair_1_name: deputy_chair1_fullname, deputy_chair_2_username: deputy_chair2_username, deputy_chair_2_name: deputy_chair2_fullname })
            .eq('id', id);

        if (updateCurrentError) {
            return { status: false, message: 'Failed to update current committee by event' };
        }

        return { status: true, message: 'Event committee by event updated successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update event committee by event' };
    }
}

export const deleteEventCommitteeService = async (id: string) => {
    try {
        const { error } = await supabase.from('event_committee').delete().eq('id', id);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete event committee by event' };
        }
        return { status: true, message: 'Event committee deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete event committee' };
    }
}