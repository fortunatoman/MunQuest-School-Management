import { supabase } from "../utils/supabase";

export const saveLeadershipRoleByEventService = async (eventId: string, leadershipRoleId: string, userId: string) => {
    try {
        const { count, error: countError } = await supabase
            .from('event_leaders')
            .select('*', { count: 'exact', head: true })
            .eq('eventid', eventId);
        if (countError) {
            console.log("error getting count", countError);
            if (countError.message && countError.message.trim() === '') {
                console.log("Empty error message - likely table doesn't exist, proceeding with insert");
            } else {
                return { status: false, message: 'Failed to get current rank count' };
            }
        }

        const nextRank = (count || 0) + 1;
        const { error } = await supabase
            .from('event_leaders')
            .insert({ eventid: eventId, leadership_role_id: leadershipRoleId, userid: userId, ranking: nextRank });

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to save leadership role by event' };
        }
        return { status: true, message: 'Leadership role saved successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to save leadership role by event' };
    }
}

export const getEventLeadersService = async (eventId: string) => {
    try {
        const { data, error } = await supabase
            .from('event_leaders')
            .select(`*,users:userid (*),leadership_roles:leadership_role_id (*),events:eventid (*)`)
            .eq('eventid', eventId)
            .order('ranking', { ascending: true });

        if (error) {
            console.log("error getting event leaders", error);
            return { status: false, message: 'Failed to get event leaders', data: [] };
        }

        return {
            status: true,
            message: 'Event leaders retrieved successfully',
            data: data || []
        };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get event leaders', data: [] };
    }
}

export const updateLeadershipRoleByEventService = async (id: string, eventId: string, roleId: string, userId: string) => {
    try {
        const { error } = await supabase
            .from('event_leaders')
            .update({ eventid: eventId, leadership_role_id: roleId, userid: userId })
            .eq('id', id)
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update leadership role by event' };
        }
        return { status: true, message: 'Leadership role updated successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update leadership role by event' };
    }
}

export const deleteLeadershipRoleByEventService = async (id: string) => {
    try {
        const { error } = await supabase.from('event_leaders').delete().eq('id', id);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete leadership role by event' };
        }
        return { status: true, message: 'Leadership role deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete leadership role by event' };
    }
}

export const updateLeadershipRoleRankingByEventService = async (id: string, direction: number) => {
    try {

        const { data: currentLeader, error: currentError } = await supabase
            .from('event_leaders')
            .select('*')
            .eq('id', id)
            .single();
        
        if (currentError || !currentLeader) {
            return { status: false, message: 'Failed to get current event leader' };
        }

        const currentRanking = currentLeader.ranking;
        const eventId = currentLeader.eventid;
        const newRanking = direction === 1 ? currentRanking + 1 : currentRanking - 1;

        const { data: allLeaders, error: allLeadersError } = await supabase
            .from('event_leaders')
            .select('*')
            .eq('eventid', eventId)
            .order('ranking', { ascending: true });


        if (allLeadersError) {
            return { status: false, message: 'Failed to get all event leaders' };
        }

        if (newRanking < 1 || newRanking > allLeaders.length) {
            return { status: false, message: 'Invalid ranking position' };
        }

        const targetLeader = allLeaders.find(leader => leader.ranking === newRanking);

        if (!targetLeader) {
            return { status: false, message: 'Target ranking position not found' };
        }

        const { error: updateCurrentError } = await supabase
            .from('event_leaders')
            .update({ ranking: newRanking })
            .eq('id', id);

        if (updateCurrentError) {
            return { status: false, message: 'Failed to update current leader ranking' };
        }

        const { error: updateTargetError } = await supabase
            .from('event_leaders')
            .update({ ranking: currentRanking })
            .eq('id', targetLeader.id);

        if (updateTargetError) {
            return { status: false, message: 'Failed to update target leader ranking' };
        }

        return { status: true, message: 'Leadership role ranking updated successfully' };
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to update leadership role ranking by event' };
    }
}
