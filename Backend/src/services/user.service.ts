import { supabase } from "../utils/supabase";
import bcrypt from 'bcryptjs';
import { makeUniqueName } from "../utils/uniqueNameGenerator";
import { verifyOrganiserService } from "./organiser.service";


export const getUserIdByGmailService = async (email: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) {
            return { status: false, message: 'Failed to get user' };
        }
        return { status: true, message: 'User fetched successfully', user: data };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get user' };
    }
}

export const userRegisterService = async (email: string, role: string = 'student', auth_id: string | null) => {
    try {
        const { error } = await supabase
            .from('users')
            .insert({ email, role, auth_id })

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Registration failed' };
        }

        if (error) {
            return { status: false, message: 'Registration failed' };
        } else {
            return { status: true, message: 'User registered successfully.' };
        }

    } catch (error) {
        console.log("Registration error:", error);
        return { status: false, message: 'Registration failed' };
    }
};

export const loginService = async (email: string, password: string) => {
    try {
        let userData: any = {};
        const user = await getUserIdByGmailService(email);
        userData = { ...userData, userId: user.user.id, userRole: user.user.role, global_role: user.user.global_role };
        const verifyOrganiser = await verifyOrganiserService(user.user.id);
        if (verifyOrganiser.status) {
            userData = { ...userData, organiserId: verifyOrganiser.data.id }
        }
        const userProfile = await getUserByIdService(user.user.id);
        if (typeof userProfile.message === 'object') {
            if (userProfile.message.grade || userProfile.message.years_of_experience || userProfile.message.phone_number || userProfile.message.phone_e164 || userProfile.message.avatar) {
                userData = { ...userData, hasProfile: true }
            } else {
                userData = { ...userData, hasProfile: false }
            }
        }
        return { status: true, message: 'Login successful', user: userData };
    } catch (error) {
        console.log("Login error:", error);
        return { status: false, message: 'Failed to login' };
    }
}

export const userLogoutService = async (accessToken: string) => {
    try {
        // Use Supabase Auth for logout
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log("Supabase logout error:", error);
            return { status: false, message: 'Logout failed' };
        }

        return {
            status: true,
            message: 'User logged out successfully'
        };
    } catch (error) {
        console.log("Logout error:", error);
        return { status: false, message: 'Logout failed' };
    }
};

export const profileDeleteService = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to delete user' };
        }
        const { error: authError } = await supabase.auth.admin.deleteUser(data?.auth_id);
        if (authError) {
            console.log("auth error", authError);
            return { status: false, message: 'Failed to delete user' };
        }
        return { status: true, message: 'User deleted successfully' };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to delete user' };
    }
}

export const teacherProfileUpdateService = async (userId: string, fullname: string, username: string, birthday: string, gender: string, school_id: string, yearsOfExperience: string, phone: string, phone_e164: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id, years_of_experience: yearsOfExperience, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const userTeacherProfileAndCustomLocalityUpdateService = async (userId: string, email: string, fullname: string, username: string, birthday: string, gender: string, custom_locality_name: string, custom_school_name: string, yearsOfExperience: string, phone: string, phone_e164: string) => {
    try {


        const { data: localityData, error: localityError } = await supabase
            .from('localities')
            .insert({ name: custom_locality_name, code: "Other", status: 'unlisted' })
            .select()
            .single();

        if (localityError) {
            console.log("error", localityError);
            return { status: false, message: 'Failed to update user' };
        }


        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('id')
            .eq('code', custom_school_name)
            .maybeSingle();

        if (checkError) {
            console.log("Check existing school error:", checkError);
            return { status: false, message: 'Failed to validate school code' };
        }

        if (existingSchool) {
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


        const { count: areaCount, error: areaCountError } = await supabase
            .from('areas')
            .select('*', { count: 'exact', head: true });

        if (areaCountError) {
            console.log("Count error:", areaCountError);
            return { status: false, message: 'Failed to count existing areas' };
        }
        const nextId = (count || 0) + 1;
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert({
                id: nextId,
                code: custom_school_name,
                name: custom_school_name,
                locality_id: localityData?.id,
                area_id: areaCount,
                status: 'unlisted'
            })
            .select()
            .single();

        if (schoolError) {
            console.log("error", schoolError);
            return { status: false, message: 'Failed to update user' };
        }
        const school_id = schoolData?.id;

        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id, years_of_experience: yearsOfExperience, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const userTeacherProfileAndCustomSchoolNameUpdateService = async (userId: string, fullname: string, username: string, birthday: string, gender: string, locality: string, custom_school_name: string, yearsOfExperience: string, phone: string, phone_e164: string) => {
    try {

        const { data: localityData, error: localityError } = await supabase
            .from('localities')
            .select('id')
            .eq('code', locality)
            .single();


        if (localityError) {
            console.log("error", localityError);
            return { status: false, message: 'Failed to update user' };
        }

        const localityIdNum = localityData?.id;
        // Check if school code already exists
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('id')
            .eq('code', custom_school_name)
            .maybeSingle();

        if (checkError) {
            console.log("Check existing school error:", checkError);
            return { status: false, message: 'Failed to validate school code' };
        }

        if (existingSchool) {
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
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert({
                id: nextId,
                code: custom_school_name,
                name: custom_school_name,
                locality_id: localityIdNum,
                area_id: 1,
                status: 'unlisted'
            })
            .select()
            .single();

        if (schoolError) {
            console.log("error", schoolError);
            return { status: false, message: 'Failed to update user' };
        }
        const school_id = schoolData?.id;

        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id, years_of_experience: yearsOfExperience, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }

};

export const userStudentProfileAndCustomLocalityUpdateService = async (userId: string, fullname: string,
    username: string, birthday: string, gender: string, custom_locality_name: string, custom_school_name: string, grade: string,
    phone: string, phone_e164: string) => {
    try {
        const { data: localityData, error: localityError } = await supabase
            .from('localities')
            .insert({ name: custom_locality_name, code: "Other", status: 'unlisted' })
            .select()
            .single();

        if (localityError) {
            console.log("error", localityError);
            return { status: false, message: 'Failed to update user' };
        }


        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('id')
            .eq('code', custom_school_name)
            .maybeSingle();

        if (checkError) {
            console.log("Check existing school error:", checkError);
            return { status: false, message: 'Failed to validate school code' };
        }

        if (existingSchool) {
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


        const { count: areaCount, error: areaCountError } = await supabase
            .from('areas')
            .select('*', { count: 'exact', head: true });

        if (areaCountError) {
            console.log("Count error:", areaCountError);
            return { status: false, message: 'Failed to count existing areas' };
        }
        // Calculate next ID (count + 1)
        const nextId = (count || 0) + 1;
        // Insert with explicit ID
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert({
                id: nextId,
                code: custom_school_name,
                name: custom_school_name,
                locality_id: localityData?.id,
                area_id: areaCount,
                status: 'unlisted'
            })
            .select()
            .single();

        if (schoolError) {
            console.log("error", schoolError);
            return { status: false, message: 'Failed to update user' };
        }
        const school_id = schoolData?.id;

        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id, grade, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const userStudentProfileAndCustomSchoolNameUpdateService = async (userId: string, fullname: string,
    username: string, birthday: string, gender: string, locality: string, custom_school_name: string, grade: string,
    phone: string, phone_e164: string) => {
    try {

        const { data: localityData, error: localityError } = await supabase
            .from('localities')
            .select('id')
            .eq('code', locality)
            .single();


        if (localityError) {
            console.log("error", localityError);
            return { status: false, message: 'Failed to update user' };
        }

        const localityIdNum = localityData?.id;
        // Check if school code already exists
        const { data: existingSchool, error: checkError } = await supabase
            .from('schools')
            .select('id')
            .eq('code', custom_school_name)
            .maybeSingle();

        if (checkError) {
            console.log("Check existing school error:", checkError);
            return { status: false, message: 'Failed to validate school code' };
        }

        if (existingSchool) {
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
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert({
                id: nextId,
                code: custom_school_name,
                name: custom_school_name,
                locality_id: localityIdNum,
                area_id: 1,
                status: 'unlisted'
            })
            .select()
            .single();

        if (schoolError) {
            console.log("error", schoolError);
            return { status: false, message: 'Failed to update user' };
        }
        const school_id = schoolData?.id;

        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id, grade, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }

};

export const studentProfileUpdateService = async (userId: string, fullname: string, username: string, birthday: string, gender: string, schoolId: string, grade: string, phone: string, phone_e164: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ fullname, username, birthday, gender, school_id: schoolId, grade, phone_number: phone, phone_e164 })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const getUserByIdService = async (id: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*,school:school_id(*,locality:locality_id(*))')
            .eq('id', id)
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get user' };
        } else {
            return { status: true, message: data };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to get user' };
    }
};

export const userStudentProfileUpdateService = async (userId: string, email: string, fullname: string, username: string, birthday: string, gender: string, school_id: string, grade: string, phone: string, phone_e164: string, avatar: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ email, fullname, username, birthday, gender, school_id, grade, phone_number: phone, phone_e164, avatar })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("update db error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const userTeacherProfileUpdateService = async (userId: string, email: string, fullname: string, username: string, birthday: string, gender: string, school_id: string, yearsOfExperience: string, phone: string, phone_e164: string, avatar: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ email, fullname, username, birthday, gender, school_id, years_of_experience: yearsOfExperience, phone_number: phone, phone_e164, avatar })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("update db error", error);
            return { status: false, message: 'Failed to update user' };
        } else {
            return { status: true, message: 'User updated successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
};

export const changePasswordService = async (userId: string, newPassword: string) => {
    try {

        const bcryptPassword = await bcrypt.hash(newPassword, 12);
        const { error } = await supabase
            .from('users')
            .update({ password: bcryptPassword })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to change password' };
        } else {
            return { status: true, message: 'Password changed successfully' };
        }
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to change password' };
    }
};

export const uploadAvatarService = async (userId: string, file: Express.Multer.File) => {
    try {
        // Generate unique filename to avoid conflicts
        const filePath = makeUniqueName(file.originalname, userId);
        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true // Don't overwrite, use unique names instead
            });

        if (uploadError) {
            console.log("Upload error:", uploadError);
            return { status: false, message: 'Failed to upload file to storage' };
        }
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const avatarUrl = urlData.publicUrl;

        // Update user record with avatar URL
        const { error: updateError } = await supabase
            .from('users')
            .update({ avatar: avatarUrl })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.log("Update error:", updateError);
            // If database update fails, try to delete the uploaded file
            await supabase.storage
                .from('avatars')
                .remove([filePath]);
            return { status: false, message: 'Failed to update user avatar' };
        }

        return {
            status: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: avatarUrl
        };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to upload avatar' };
    }
};

export const getAllUsersService = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*,school:school_id(*)');
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to get all users' };
        } else {
            return { status: true, data: data };
        }
    } catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to get all users' };
    }
}

export const updateUserStatusService = async (userId: string, user_status: string) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ user_status })
            .eq('id', userId);
        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user status' };
        } else {
            return { status: true, message: 'User status updated successfully' };
        }
    }
    catch (error: any) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user status' };
    }
}

export const updateUserGolbalStatusService = async (username: string, email: string) => {
    try {
        console.log(`📤 Sending superuser invitation to ${username} (${email})`);

        const { data, error } = await supabase
            .from('users')
            .update({ global_role: "superuser" })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to update user global status' };
        }

        if (!data || data.length === 0) {
            console.log("User not found");
            return { status: false, message: 'User not found' };
        }

        // Send socket notification to the invited user
        const sendUserNotification = (global as any).sendUserNotification;
        const io = (global as any).io;
        
        if (sendUserNotification && io && data.id) {
            const actionMessage = `🎉 Congratulations! You have been promoted to Superuser status in MunQuest. You now have administrative privileges to manage the platform. Welcome to the MunQuest admin team!`;
            const notificationType = 'user_status_updated';
            
            const notificationData = {
                message: actionMessage,
                userName: username,
                userEmail: email,
                action: 'superuser_promotion',
                status: 'superuser',
                timestamp: new Date().toISOString()
            };
            
            console.log(`📤 Sending superuser promotion notification to user ${data.id}`);
            console.log(`📋 Notification data:`, notificationData);
            
            // Check if user is connected to their room
            const roomName = `user_${data.id}`;
            const room = io.sockets.adapter.rooms.get(roomName);
            const roomSize = room ? room.size : 0;
            console.log(`👥 Room ${roomName} has ${roomSize} connected users`);
            
            if (roomSize > 0) {
                // User is connected, send targeted notification
                sendUserNotification(data.id, notificationType, notificationData);
                console.log(`✅ Targeted notification sent to connected user ${data.id}`);
            } else {
                // User is not connected, broadcast to all users (they'll get it when they connect)
                console.log(`📢 User ${data.id} not connected, broadcasting to all users`);
                const broadcastNotification = (global as any).broadcastNotification;
                if (broadcastNotification) {
                    broadcastNotification(notificationType, notificationData);
                }
            }
        } else {
            console.log('❌ Send user notification function or io not available, or no user ID');
        }

        console.log(`✅ User ${username} (${email}) promoted to superuser successfully`);
        return { status: true, message: 'User successfully promoted to superuser' };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user global status' };
    }
}

export const removeUserGolbalStatusService = async (username: string, email: string) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ global_role: "user" })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return { status: false, message: 'Failed to remove user global status' };
        }

        if (!data || data.length === 0) {
            console.log("User not found");
            return { status: false, message: 'User not found' };
        }

        return { status: true, message: 'User global status removed successfully' };
    }
    catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to remove user global status' };
    }
}

export const updateUserBySuperUserService = async (userId: string, userData: {
    username?: string;
    fullname?: string;
    email?: string;
    academicLevel?: string;
    school?: string;
    munExperience?: string;
    globalRole?: string;
}) => {
    try {
        console.log(`🔄 Superuser updating user ${userId} with data:`, userData);

        // Build update object with only provided fields
        const updateData: any = {};

        if (userData.username !== undefined) updateData.username = userData.username;
        if (userData.fullname !== undefined) updateData.fullname = userData.fullname;
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.academicLevel !== undefined) updateData.grade = userData.academicLevel;
        if (userData.school !== undefined) updateData.school_id = userData.school;
        if (userData.munExperience !== undefined) updateData.mun_experience = userData.munExperience;
        if (userData.globalRole !== undefined) updateData.global_role = userData.globalRole;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.log("update db error", error);
            return { status: false, message: 'Failed to update user' };
        }

        if (!data) {
            console.log("User not found");
            return { status: false, message: 'User not found' };
        }

        console.log(`✅ User ${userId} updated successfully`);
        return { status: true, message: 'User updated successfully' };
    } catch (error) {
        console.log("error", error);
        return { status: false, message: 'Failed to update user' };
    }
}