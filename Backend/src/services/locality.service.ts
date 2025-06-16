import { supabase } from "../utils/supabase";

export const getLocalitiesService = async () => {
    try {
        const { data, error } = await supabase.from('localities').select('*');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get localities' };
        } else {
            return { status: true, message: 'Localities fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get localities' };
    }
}

export const updateLocalityService = async (localityId: string, name: string, code: string) => {
    try {
        const { error } = await supabase.from('localities').update({ name, code }).eq('id', localityId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update locality' };
        } else {
            return { status: true, message: 'Locality updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update locality' };
    }
}

export const deleteLocalityService = async (localityId: string) => {
    try {
        const { error } = await supabase.from('localities').delete().eq('id', localityId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete locality' };
        } else {
            return { status: true, message: 'Locality deleted successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete locality' };
    }
}

export const mergeLocalityService = async (localityId: string) => {
    try {
        const { data, error } = await supabase.from('localities').delete().eq('id', localityId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to merge locality' };
        } else {
            return { status: true, message: 'Locality merged successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to merge locality' };
    }
}