import { supabase } from "../utils/supabase";

export const getSchoolsService = async () => {
    try {
        const { data, error } = await supabase.from('schools').select('*,locality:locality_id(*),area:area_id(*)');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get schools' };
        } else {
            return { status: true, message: 'Schools fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get schools' };
    }
}

export const updateSchoolService = async (schoolId: string, code: string, name: string, locality_id: string, area_id: string) => {
    try {
        const { error } = await supabase.from('schools').update({ code, name, locality_id, area_id }).eq('id', schoolId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update school' };
        } else {
            return { status: true, message: 'School updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update school' };
    }
}

export const updateSchoolStatusService = async (schoolId: string, status: string) => {
    try {
        const { error } = await supabase.from('schools').update({ status }).eq('id', schoolId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update school status' };
        } else {
            return { status: true, message: 'School status updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update school status' };
    }
}

export const deleteSchoolService = async (schoolId: string) => {
    try {
        const { error } = await supabase.from('schools').delete().eq('id', schoolId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete school' };
        } else {
            return { status: true, message: 'School deleted successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete school' };
    }
}

export const createSchoolService = async (code: string, name: string, locality_id: string, area_id: string) => {
    try {
        // Input validation
        if (!code || !name || !locality_id || !area_id) {
            return { status: false, message: 'All fields (code, name, locality_id, area_id) are required' };
        }

        // Validate that locality_id and area_id are valid numbers
        const localityIdNum = parseInt(locality_id);
        const areaIdNum = parseInt(area_id);
        
        if (isNaN(localityIdNum) || isNaN(areaIdNum)) {
            return { status: false, message: 'locality_id and area_id must be valid numbers' };
        }

        // Check if school code already exists
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('id')
            .eq('code', code)
            .limit(1);

        if (checkError) {
            console.log("Check existing school error:", checkError);
            return { status: false, message: 'Failed to validate school code' };
        }

        if (existingSchool && existingSchool.length > 0) {
            return { status: false, message: 'School with this code already exists' };
        }

        // Count existing rows to determine next ID
        const { count, error: countError } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.log("Count error:", countError);
            return { status: false, message: 'Failed to count existing schools' };
        }

        // Calculate next ID (count + 1)
        const nextId = (count || 0) + 1;

        // Insert with explicit ID
        const { data, error } = await supabase
            .from('schools')
            .insert({ 
                id: nextId,
                code, 
                name, 
                locality_id: localityIdNum, 
                area_id: areaIdNum 
            })
            .select();

        if (error) {
            console.log("Insert error:", error);
            
            if (error.code === '23505') {
                return { status: false, message: 'School with this ID or code already exists' };
            } else if (error.code === '23503') {
                return { status: false, message: 'Invalid locality_id or area_id provided' };
            } else {
                return { status: false, message: `Failed to create school: ${error.message}` };
            }
        } else {
            return { status: true, message: 'School created successfully', data: data };
        }
    } catch (error) {
        console.log("Unexpected error:", error);
        return { status: false, message: 'Failed to create school due to unexpected error' };
    }
}

export const mergeShoolsService = async (primaryLocalityId: string, secondaryLocalityId: string) => {
    try {
        const { data, error } = await supabase.from('schools').delete().eq('locality_id', primaryLocalityId).eq('locality_id', secondaryLocalityId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to merge schools' };
        } else {
            return { status: true, message: 'Schools merged successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to merge schools' };
    }
}