import { supabase } from "../utils/supabase";

export const getLeadershipRolesService = async () => {
    try {
        const { data, error } = await supabase.from('leadership_roles').select('*');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get leadership roles' };
        } else {
            return { status: true, message: 'Leadership roles fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get leadership roles' };
    }
}

export const addLeadershipRoleService = async (abbr: string, leadership_role: string) => {
    try {
        const { data, error } = await supabase.from('leadership_roles').insert({ abbr, leadership_role });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to add leadership role' };
        } else {
            return { status: true, message: 'Leadership role added successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to add leadership role' };
    }
}

export const updateLeadershipRoleService = async (leadershipRoleId: string, abbr: string, leadership_role: string) => {
    try {
        const { data, error } = await supabase.from('leadership_roles').update({ abbr, leadership_role }).eq('id', leadershipRoleId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update leadership role' };
        } else {
            return { status: true, message: 'Leadership role updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update leadership role' };
    }
}

export const deleteLeadershipRoleService = async (leadershipRoleId: string) => {
    try {
        const { error } = await supabase.from('leadership_roles').delete().eq('id', leadershipRoleId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete leadership role' };
        } else {
            return { status: true, message: 'Leadership role deleted successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete leadership role' };
    }
}