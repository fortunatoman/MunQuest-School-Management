import { supabase } from "../utils/supabase";

export const getCountriesService = async () => {
    try {
        const { data, error } = await supabase.from('countries').select('*');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get countries' };
        } else {
            return { status: true, message: 'Countries fetched successfully', data: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get countries' };
    }
}