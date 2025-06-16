import { supabase } from "../utils/supabase";
import { makeUniqueName } from "../utils/uniqueNameGenerator";

// Document upload service for PDFs and other documents
export const uploadDocumentService = async (userId: string, file: Express.Multer.File) => {
    try {
        // Generate unique filename to avoid conflicts
        const filePath = makeUniqueName(file.originalname, userId);
        // Upload file to Supabase storage (using 'documents' bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true // Allow overwriting existing files
            });

        if (uploadError) {
            console.log("Upload error:", uploadError);
            return { status: false, message: 'Failed to upload document to storage' };
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const documentUrl = urlData.publicUrl;

        return {
            status: true,
            message: 'Document uploaded successfully',
            documentUrl: documentUrl,
        };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to upload document' };
    }
};

export const organiserApprovalRequestService = async (userId: string, school_id: string, locality_id: string, role: string, evidenceDocs: string[]) => {
    try {
        const { data: evidenceData, error: evidenceError } = await supabase
            .from('organiser_evidence')
            .insert({ file_url: evidenceDocs })
            .select()
            .single();

        if (evidenceError) {
            console.log("evidenceError", evidenceError);
            return { status: false, message: 'Failed to request organiser approval' };
        }
        console.log("evidenceData", evidenceData);

        const { data, error } = await supabase
            .from('organisers')
            .insert({ userid: userId, school_id, locality_id, role, evidence_id: evidenceData.id })
            .select()
            .single();

        if (error || evidenceError) {
            console.log("error", error);
            return { status: false, message: 'Failed to request organiser approval' };
        }
        return { status: true, message: 'Organiser approval requested successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to request organiser approval' };
    }
};

export const verifyOrganiserService = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('organisers')
            .select('*')
            .eq('userid', userId)
            .eq('status', 'approved')
            .single();
        if (error) {
            return { status: false, message: 'Failed to verify organiser' };
        }
        return { status: true, message: 'Organiser verified successfully', data: data };
    }
    catch (error) {
        return { status: false, message: 'Failed to verify organiser' };
    }
}

export const getAllOrganisersService = async () => {
    try {
        const { data, error } = await supabase
            .from('organisers')
            .select(`
                *,
                users:userid (*),
                locality:locality_id(*),
                school:school_id(*),
                evidence:evidence_id(*)
            `)
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get all organisers' };
        } else {
            return { status: true, data: data };
        }
    } catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all organisers' };
    }
}

export const updateOrganiserStatusService = async (organiserId: string, status: string, userId: string) => {
    console.log("organiserId, status, userId", organiserId, status, userId)
    try {
        const { error } = await supabase
            .from('organisers')
            .update({ status, actioned_at: new Date().toISOString(), actioned_by_user_id: userId })
            .eq('id', organiserId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update organiser status' };
        } else {
            return { status: true, message: 'Organiser status updated successfully' };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to update organiser status' };
    }
}

export const deleteOrganiserService = async (organiserId: string) => {
    try {
        const { error } = await supabase
            .from('organisers')
            .delete()
            .eq('id', organiserId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Cannot delete organiser because he already has an events' };
        } else {
            return { status: true, message: 'Organiser deleted successfully' };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Cannot delete organiser because he already has an events' };
    }
}

export const addOrganiserBySuperUserService = async (user_id: string, role: string, school_id: string, locality_id: string, evidence: string, status: string, actioned_by_user_id: string) => {
    try {


        const { data: organiser_evidence_Data, error: organiser_evidence_Error } = await supabase
            .from('organiser_evidence')
            .insert({ file_url: evidence })
            .select()
            .single();

        if (organiser_evidence_Error) {
            console.log("organiser_evidence_Data", organiser_evidence_Error);
            return { status: false, message: 'Failed to add organiser by super user' };
        }


        const { data: organiser_Data, error: organiser_Error } = await supabase
            .from('organisers')
            .insert({ userid: user_id, role, school_id, locality_id, status, actioned_by_user_id, evidence_id: organiser_evidence_Data.id })
            .select()
            .single();

        if (organiser_Error) {
            console.log("organiser_Data", organiser_Error);
            return { status: false, message: 'Failed to add organiser by super user' };
        }


        return { status: true, message: 'Organiser added by super user successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to add organiser by super user' };
    }
}

export const assignOrganiserToSchoolService = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('organisers')
            .insert({ userid: userId, status: "approved", role: "organiser" })
            .select()
            .single();
        if (error || !data) {
            console.log("error", error);
            return { status: false, message: 'Failed to assign organiser to school' };
        } else {
            return { status: true, message: 'Organiser assigned to school successfully', data: data };
        }
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to assign organiser to school' };
    }
}

export const removeOrganiserFromSchoolService = async (userId: string) => {
    try {
        const { error } = await supabase
            .from('organisers')
            .delete()
            .eq('userid', userId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to remove organiser from school' };
        } else {
            return { status: true, message: 'Organiser removed from school successfully' };
        }
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to remove organiser from school' };
    }
}