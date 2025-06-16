import { supabase } from "../utils/supabase";

export const getAreasService = async () => {
    try {
        const { data, error } = await supabase.from('areas').select('*');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get areas' };
        } else {
            return { status: true, message: 'Areas fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get areas' };
    }
}

export const createAreaService = async (locality_id: string, name: string, code: string) => {
    try {
        const { error } = await supabase.from('areas').insert({ name, code, locality_id });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to create area' };
        } else {
            return { status: true, message: 'Area created successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to create area' };
    }
}

export const deleteAreaService = async (areaId: string) => {
    try {
        const { error } = await supabase.from('areas').delete().eq('id', areaId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete area' };
        } else {
            return { status: true, message: 'Area deleted successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete area' };
    }
}

export const updateAreaService = async (areaId: string, name: string, code: string) => {
    try {
        const { error } = await supabase.from('areas').update({ code, name }).eq('id', areaId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update area' };
        } else {
            return { status: true, message: 'Area updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update area' };
    }
}

export const updateAreaStatusService = async (areaId: string, status: boolean) => {
    try {
        const { error } = await supabase.from('areas').update({ status }).eq('id', areaId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update area status' };
        } else {
            return { status: true, message: 'Area status updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update area status' };
    }
}