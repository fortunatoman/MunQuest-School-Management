import { supabase } from "../utils/supabase";
import * as XLSX from 'xlsx';
import { generateUsername } from "../utils/uniqueNameGenerator";

export const getNextRegistrationNumber = async (eventId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId);

        if (error) {
            console.log("Error counting registrations:", error);
            return 1;
        }

        return Number((count || 0)) + 1;
    } catch (error) {
        console.log("Error in getNextRegistrationNumber:", error);
        return 1;
    }
};

export const getRegistrationsService = async (eventId: string) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*,user:user_id(*,school:school_id(*,locality:locality_id(*))),event:event_id(*),pref_committee_1:pref_committee_1_id(*),pref_committee_2:pref_committee_2_id(*),pref_committee_3:pref_committee_3_id(*)')
            .eq('event_id', eventId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get registrations' };
        }
        return { status: true, message: 'Registrations fetched successfully', data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get registrations' };
    }
}

export const getAllRegistrationsService = async () => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
        if (error) {
            console.log('error', error);
            return { status: false, message: 'Failed to get all resgistrations' };
        }
        return { status: true, message: 'All registrations fetched successfully', data };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all resgistrations' }
    }
}

export const eventRegistrationTeacherService = async (eventId: string, userId: string, foodPreference: string, foodAllergies: string) => {
    try {
        const registrationNo = await getNextRegistrationNumber(eventId);

        const { error } = await supabase
            .from('registrations')
            .insert({
                registration_no: registrationNo,
                event_id: eventId,
                user_id: userId,
                food_pref: foodPreference,
                food_allergies: foodAllergies
            });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to register for event' };
        }
        return { status: true, message: 'Event registered successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to register for event' };
    }
}

export const eventRegistrationStudentService = async (eventId: string, userId: string, mun_experience: string, pref_committee_1_id: string,
    pref_committee_2_id: string, pref_committee_3_id: string, food_pref: string, food_allergies: string,
    emergency_name: string, emergency_phone: string) => {
    try {
        const registrationNo = await getNextRegistrationNumber(eventId);

        const { error } = await supabase
            .from('registrations')
            .insert({
                registration_no: registrationNo,
                event_id: eventId,
                user_id: userId,
                mun_experience,
                pref_committee_1_id,
                pref_committee_2_id,
                pref_committee_3_id,
                food_pref,
                food_allergies,
                emergency_name,
                emergency_phone
            });
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to register for event' };
        }
        return { status: true, message: 'Event registered successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to register for event' };
    }
}

export const getRegistrationsInfoByEventIdAndUserIdService = async (eventId: string, userId: string) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*,user:user_id(*,school:school_id(*,locality:locality_id(*))),event:event_id(*),pref_committee_1:pref_committee_1_id(*),pref_committee_2:pref_committee_2_id(*),pref_committee_3:pref_committee_3_id(*)')
            .eq('event_id', eventId)
            .eq('user_id', userId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get registrations info by event id and user id' };
        }
        return { status: true, message: 'Registrations info by event id and user id fetched successfully', data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get registrations info by event id and user id' };
    }
}

export const deleteRegistrationService = async (registrationId: string) => {
    try {
        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', registrationId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete registration' };
        }
        return { status: true, message: 'Registration deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete registration' };
    }
}

export const deleteDelegateService = async (delegateId: string) => {
    try {
        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', delegateId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete delegate' };
        }
        return { status: true, message: 'Delegate deleted successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete delegate' };
    }
}

export const assignDelegateService = async (delegateId: string, committeeId: string, countryId: string) => {
    try {
        const { error } = await supabase
            .from('registrations')
            .update({
                assigned_committees: committeeId ? committeeId : null,
                assigned_country: countryId ? countryId : null
            })
            .eq('id', delegateId);

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to assign delegate' };
        }

        return { status: true, message: 'Delegate assigned successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to assign delegate' };
    }
}

export const unassignDelegateService = async (delegateId: string) => {
    try {
        const { error } = await supabase
            .from('registrations')
            .update({
                assigned_committees: null,
                assigned_country: null
            })
            .eq('id', delegateId);

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to unassign delegate' };
        }

        return { status: true, message: 'Delegate unassigned successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to unassign delegate' };
    }
}

// Toggle delegate flag
export const toggleDelegateFlagService = async (delegateId: string, flag: boolean) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .update({ flag: flag })
            .eq('id', delegateId)
            .select();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to toggle delegate flag' };
        }

        return { status: true, message: 'Delegate flag updated successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to toggle delegate flag' };
    }
}

// Merge delegates
export const mergeDelegatesService = async (selectedDelegates: number[]) => {
    try {
        if (selectedDelegates.length < 2) {
            return { status: false, message: 'At least two delegates are required for merging' };
        }

        // Get all selected delegates
        const { data: delegates, error: delegatesError } = await supabase
            .from('registrations')
            .select('*')
            .in('id', selectedDelegates);

        if (delegatesError || !delegates || delegates.length === 0) {
            return { status: false, message: 'Selected delegates not found' };
        }

        // Use the first delegate as primary
        const primaryDelegate = delegates[0];
        const secondaryDelegates = delegates.slice(1);

        // Merge data from secondary delegates into primary
        const mergedData = {
            // Keep primary delegate's basic info
            // Merge preferred committees (take non-null values from any delegate)
            pref_committee_1: primaryDelegate.pref_committee_1 || secondaryDelegates.find(d => d.pref_committee_1)?.pref_committee_1,
            pref_committee_2: primaryDelegate.pref_committee_2 || secondaryDelegates.find(d => d.pref_committee_2)?.pref_committee_2,
            pref_committee_3: primaryDelegate.pref_committee_3 || secondaryDelegates.find(d => d.pref_committee_3)?.pref_committee_3,
            // Keep the highest MUN experience
            mun_experience: Math.max(
                primaryDelegate.mun_experience || 0,
                ...secondaryDelegates.map(d => d.mun_experience || 0)
            ),
            updated_at: new Date().toISOString()
        };

        // Update primary delegate
        const { error: updateError } = await supabase
            .from('registrations')
            .update(mergedData)
            .eq('id', primaryDelegate.id);

        if (updateError) {
            return { status: false, message: 'Failed to update primary delegate' };
        }

        // Delete secondary delegates
        const { error: deleteError } = await supabase
            .from('registrations')
            .delete()
            .in('id', secondaryDelegates.map(d => d.id));

        if (deleteError) {
            return { status: false, message: 'Failed to delete secondary delegates' };
        }

        return { status: true, message: 'Delegates merged successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to merge delegates' };
    }
}

// Upload delegates from Excel/CSV file
export const uploadDelegatesService = async (file: Express.Multer.File, eventId: string): Promise<{
    status: boolean;
    message: string;
    linked?: number;
    created?: number;
    needsReview?: number;
    errors?: string[];
}> => {
    try {
        // Parse the file based on its extension
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length < 2) {
            return {
                status: false,
                message: 'File must contain at least a header row and one data row',
                linked: 0,
                created: 0,
                needsReview: 0,
                errors: []
            };
        }

        // Get headers and normalize them
        const headers = (data[0] as string[]).map(h =>
            String(h).trim().toLowerCase().replace(/\s+/g, ' ')
        );

        console.log('Detected headers:', headers);

        const delegates = [];
        const errors: string[] = [];

        // Helper: normalize Excel date values to YYYY-MM-DD
        const toIsoDate = (input: any): string => {
            if (input === null || input === undefined || input === '') return '';
            // Excel serial number -> JS Date
            if (typeof input === 'number' && isFinite(input)) {
                const ms = Math.round((input - 25569) * 86400 * 1000);
                const d = new Date(ms);
                if (isNaN(d.getTime())) return '';
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            // Common string formats like M/D/YYYY
            const str = String(input).trim();
            const mdy = str.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*$/);
            if (mdy) {
                const m = parseInt(mdy[1], 10);
                const d = parseInt(mdy[2], 10);
                const y = parseInt(mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3], 10);
                const mm = String(m).padStart(2, '0');
                const dd = String(d).padStart(2, '0');
                return `${y}-${mm}-${dd}`;
            }
            // Fallback: Date.parse
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
                const yyyy = parsed.getUTCFullYear();
                const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(parsed.getUTCDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            return '';
        };

        // // Process each row
        for (let i = 1; i < data.length; i++) {
            const row = data[i] as any[];

            // Skip empty rows
            if (!row || row.length === 0) continue;

            // Create delegate object with special handling for date columns
            const delegate: any = {};
            headers.forEach((header, index) => {
                const raw = (row as any[])[index];
                const key = String(header).toLowerCase();
                if (key === 'birthday' || key === 'date of birth' || key === 'dob') {
                    delegate[header] = toIsoDate(raw);
                } else {
                    delegate[header] = String(raw ?? '').trim();
                }
            });
            // Map to standardized fields (aligned to sample: Email, Full Name, Birthday, Gender, Phone Number, School, Role, Grade, Mun_Experience, Food Pref, Food Allergies, Emergency Name, Emergency Phone)
            const normalizedDelegate = {
                email: (delegate.email || delegate['email address'] || '').toLowerCase(),
                name: delegate.name || delegate['full name'] || '',
                school: delegate.school || delegate['school name'] || '',
                academicLevel: delegate['academic level'] || delegate.grade || delegate.year || '',
                munExperience: delegate['mun_experience'] || delegate['mun experience'] || delegate.experience || '',
                preferredCommittees: delegate['preferred committees'] || delegate.committees || '',
                phone: delegate.phone || delegate['phone number'] || delegate.mobile || '',
                birthday: delegate.birthday || delegate['date of birth'] || '',
                gender: (delegate.gender || '').toLowerCase(),
                role: (delegate.role || '').toLowerCase(),
                foodPref: delegate['food pref'] || delegate['food preference'] || '',
                foodAllergies: delegate['food allergies'] || '',
                emergencyName: delegate['emergency name'] || '',
                emergencyPhone: delegate['emergency phone'] || ''
            } as any;

            // Validate required fields
            if (!normalizedDelegate.email || !normalizedDelegate.name) {
                const reason = !normalizedDelegate.email ? 'missing email' : 'missing name';
                errors.push(`Row ${i + 1}: ${reason}`);
                continue;
            }

            delegates.push(normalizedDelegate);
        }

        console.log(`Parsed ${delegates.length} valid delegates from ${data.length - 1} rows`);

        // Process delegates and attempt to create/link them
        const result = {
            linked: 0,
            created: 0,
            needsReview: 0,
            errors: [...errors]
        };

        // Helper: get or create school by name and return id
        const getOrCreateSchoolId = async (schoolName: string): Promise<number | null> => {
            const name = (schoolName || '').trim();
            if (!name) return null;
            // Try by exact name or code
            const { data: existingByName } = await supabase
                .from('schools')
                .select('id')
                .or(`name.eq.${name},code.eq.${name}`)
                .maybeSingle();
            if (existingByName?.id) return existingByName.id;

            // Count to generate id similar to other services
            const { count } = await supabase
                .from('schools')
                .select('*', { count: 'exact', head: true });
            const nextId = (count || 0) + 1;
            const { data: newSchool } = await supabase
                .from('schools')
                .insert({ id: nextId, code: name, name, locality_id: 1, area_id: 1, status: 'unlisted' })
                .select('id')
                .single();
            return newSchool?.id || null;
        };
        console.log(delegates)
        for (const delegate of delegates) {
            try {
                // Try to find user by email
                const { data: existingUser, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', delegate.email)
                    .single();

                console.log(userError, "userError")

                if (existingUser) {
                    // User exists, check if already registered for this event
                    const { data: existingRegistration } = await supabase
                        .from('registrations')
                        .select('id')
                        .eq('user_id', existingUser.id)
                        .eq('event_id', eventId)
                        .single();

                    if (existingRegistration) {
                        // Already registered
                        result.linked++;
                    } else {
                        // User exists but not registered - create registration
                        const registrationNo = await getNextRegistrationNumber(eventId);
                        const { error: registrationError } = await supabase
                            .from('registrations')
                            .insert({
                                registration_no: registrationNo,
                                event_id: eventId,
                                user_id: existingUser.id,
                                mun_experience: delegate.munExperience ? Number(delegate.munExperience) : null,
                                food_pref: delegate.foodPref || null,
                                food_allergies: delegate.foodAllergies || null,
                                emergency_name: delegate.emergencyName || null,
                                emergency_phone: delegate.emergencyPhone || null
                            });

                        if (registrationError) {
                            result.errors.push(`${delegate.name}: Failed to create registration`);
                        } else {
                            result.linked++;
                        }
                    }
                } else {
                    // User doesn't exist - create new user first
                    const schoolId = await getOrCreateSchoolId(delegate.school);
                    const { data: newUser, error: createUserError } = await supabase
                        .from('users')
                        .insert({
                            email: delegate.email,
                            fullname: delegate.name,
                            username: generateUsername(delegate.name),
                            role: 'student',
                            grade: delegate.academicLevel || null,
                            phone_number: delegate.phone || null,
                            birthday: delegate.birthday || null,
                            gender: delegate.gender || null,
                            school_id: schoolId
                        })
                        .select('id')
                        .single();
                    console.log(createUserError, "createUserError")
                    if (createUserError || !newUser) {
                        result.errors.push(`${delegate.name}: Failed to create user`);
                    } else {
                        // Now create registration
                        const registrationNo = await getNextRegistrationNumber(eventId);
                        const { error: registrationError } = await supabase
                            .from('registrations')
                            .insert({
                                registration_no: registrationNo,
                                event_id: eventId,
                                user_id: newUser.id,
                                mun_experience: delegate.munExperience ? Number(delegate.munExperience) : null,
                                food_pref: delegate.foodPref || null,
                                food_allergies: delegate.foodAllergies || null,
                                emergency_name: delegate.emergencyName || null,
                                emergency_phone: delegate.emergencyPhone || null
                            });

                        if (registrationError) {
                            result.errors.push(`${delegate.name}: Failed to create registration`);
                        } else {
                            result.created++;
                        }
                    }
                }
            } catch (err) {
                result.errors.push(`${delegate.name}: ${err}`);
            }
        }

        return {
            status: true,
            message: `Processed ${delegates.length} delegates`,
            ...result
        };

    } catch (error) {
        console.log('Error in uploadDelegatesService:', error);
        return {
            status: false,
            message: 'Failed to parse file. Please ensure it is a valid Excel or CSV file.',
            linked: 0,
            created: 0,
            needsReview: 0,
            errors: []
        };
    }
}

export const checkRegistrationStatusService = async (userId: string) => {
    try {
        console.log('userId', userId);
        const { data, error } = await supabase
            .from('organisers')
            .select('*')
            .eq('userid', userId)
            .single();
        if (error || !data) {
            console.log('Error checking organiser status:', error);
            return { status: false, message: 'Don\'t have an organiser account', data: null };
        }
        return { status: true, message: 'Organiser status checked successfully', data: data.status };
    }
    catch (error) {
        console.log('Error checking organiser status:', error);
        return { status: false, message: 'Failed to check organiser status' };
    }
}