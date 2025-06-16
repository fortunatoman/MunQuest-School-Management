import { supabase } from "../utils/supabase";

export const getCommitteesService = async () => {
    try {
        const { data, error } = await supabase.from('committees').select('*');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get committees' };
        } else {
            return { status: true, message: 'Committees fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get committees' };
    }
}

export const addCommitteeService = async (abbr: string, committee: string, category: string) => {
    try {
        const { data, error } = await supabase.from('committees').insert({ abbr, committee, category });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to add committee' };
        } else {
            return { status: true, message: 'Committee added successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to add committee' };
    }
}

export const updateCommitteeService = async (committeeId: string, abbr: string, committee: string, category: string) => {
    try {
        const { data, error } = await supabase.from('committees').update({ abbr, committee, category }).eq('id', committeeId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update committee' };
        } else {
            return { status: true, message: 'Committee updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update committee' };
    }
}

export const deleteCommitteeService = async (committeeId: string) => {
    try {
        const { error } = await supabase.from('committees').delete().eq('id', committeeId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete committee' };
        } else {
            return { status: true, message: 'Committee deleted successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete committee' };
    }
}