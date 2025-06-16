import { Request, Response } from 'express';
import {
  getUserIdByGmailService, profileDeleteService, changePasswordService, getUserByIdService,
  studentProfileUpdateService, teacherProfileUpdateService, uploadAvatarService, userRegisterService,
  getAllUsersService, userStudentProfileUpdateService, userTeacherProfileUpdateService, updateUserStatusService,
  userTeacherProfileAndCustomLocalityUpdateService, userTeacherProfileAndCustomSchoolNameUpdateService,
  userStudentProfileAndCustomSchoolNameUpdateService,
  userStudentProfileAndCustomLocalityUpdateService,
  updateUserGolbalStatusService,
  removeUserGolbalStatusService,
  updateUserBySuperUserService,
  loginService
} from '../services/user.service';

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const data = await getUserByIdService(userId);
    if (data.status === false) {
      return res.status(401).json({
        success: false,
        error: data.message
      });
    }

    res.status(200).json({
      success: true,
      data: data.message
    });
  } catch (error) {
    console.log('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserIdByGmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const data = await getUserIdByGmailService(email);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({ success: true, message: data.message, user: data.user });
    }
  }
  catch (error) {
    console.log('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, role, auth_id } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email and role are required'
      });
    }

    const data = await userRegisterService(email, role, auth_id);

    if (data.status === false) {
      return res.status(400).json({
        success: false,
        message: data.message
      });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message,
      });
    }

  } catch (error: any) {
    console.log('Error registering user:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({ success: true, message: data.message, data: data.user });
    }
  } catch (error) {
    console.log('Error logging in:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export const profileDelete = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    
    // Get user details before deleting for notification
    const userData = await getUserByIdService(userId);
    if (userData.status === false) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const userName = userData.message?.name || `User ${userId}`;
    const userEmail = userData.message?.email || '';
    console.log(`👤 User details - Name: ${userName}, Email: ${userEmail}`);

    const data = await profileDeleteService(userId);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      // Send targeted notification to the specific user about account deletion
      const sendUserNotification = (global as any).sendUserNotification;
      if (sendUserNotification) {
        const actionMessage = `Your account has been deleted by an administrator. If you believe this is an error, please contact support.`;
        
        const notificationData = {
          message: actionMessage,
          userName: userName,
          userEmail: userEmail,
          action: 'account_deleted',
          timestamp: new Date().toISOString()
        };
        
        console.log(`📤 Sending account deletion notification to user ${userId}`);
        sendUserNotification(userId, 'user_account_deleted', notificationData);
      } else {
        console.log('❌ Send user notification function not available');
      }
      
      return res.status(200).json({ success: true, message: data.message });
    }
  }
  catch (error: any) {
    console.log('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const teacherProfileUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { fullname, username, birthday, gender, school_id, yearsOfExperience, phone, phone_e164 } = req.body;
    const data = await teacherProfileUpdateService(userId, fullname, username, birthday, gender, school_id, yearsOfExperience, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const studentProfileUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { fullname, username, birthday, gender, school_id, grade, phone, phone_e164 } = req.body;
    console.log(userId, fullname, username, birthday, gender, school_id, grade, phone, phone_e164);
    const data = await studentProfileUpdateService(userId, fullname, username, birthday, gender, school_id, grade, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userStudentProfileUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { fullname,
      username,
      birthday,
      gender,
      school_id,
      grade,
      phone,
      email,
      phone_e164, avatar } = req.body;
    const data = await userStudentProfileUpdateService(userId, email, fullname, username, birthday, gender, school_id, grade, phone, phone_e164, avatar);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userTeacherProfileUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { fullname,
      username,
      birthday,
      gender,
      school_id,
      yearsOfExperience,
      phone,
      email,
      phone_e164, avatar } = req.body;
    const data = await userTeacherProfileUpdateService(userId, email, fullname, username, birthday, gender, school_id, yearsOfExperience, phone, phone_e164, avatar);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userTeacherProfileAndCustomLocalityUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { fullname,
      username,
      birthday,
      gender,
      custom_locality_name,
      custom_school_name,
      yearsOfExperience,
      phone,
      email,
      avatar,
      phone_e164 } = req.body;
    const data = await userTeacherProfileAndCustomLocalityUpdateService(userId, email, fullname, username, birthday, gender, custom_locality_name, custom_school_name, yearsOfExperience, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userTeacherProfileAndCustomSchoolNameUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const {
      fullname,
      username,
      birthday,
      gender,
      locality,
      custom_school_name,
      yearsOfExperience,
      phone,
      phone_e164
    } = req.body;

    const data = await userTeacherProfileAndCustomSchoolNameUpdateService(userId, fullname, username, birthday, gender, locality, custom_school_name, yearsOfExperience, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userStudentProfileAndCustomLocalityUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    console.log(req.body);
    const { fullname,
      username,
      birthday,
      gender,
      custom_locality_name,
      custom_school_name,
      grade,
      phone,
      phone_e164 } = req.body;
    const data = await userStudentProfileAndCustomLocalityUpdateService(userId, fullname, username, birthday,
      gender, custom_locality_name, custom_school_name, grade, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const userStudentProfileAndCustomSchoolNameUpdate = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const {
      fullname,
      username,
      birthday,
      gender,
      locality,
      custom_school_name,
      grade,
      phone,
      phone_e164
    } = req.body;

    const data = await userStudentProfileAndCustomSchoolNameUpdateService(userId, fullname, username, birthday, gender, locality, custom_school_name, grade, phone, phone_e164);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { newPassword } = req.body;
    const data = await changePasswordService(userId, newPassword);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message
      });
    }
  } catch (error) {
    console.log('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }

    const data = await uploadAvatarService(userId, req.file);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({
        success: true,
        message: data.message,
        avatarUrl: data.avatarUrl
      });
    }
  } catch (error: any) {
    console.log('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await getAllUsersService();
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({ success: true, data: data.data });
    }
  } catch (error: any) {
    console.log('Error getting all users:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as any;
    const { status } = req.body;

    console.log(`🔄 Updating user status for userId: ${userId}, status: ${status}`);

    // Get user details before updating for notification
    const userData = await getUserByIdService(userId);
    if (userData.status === false) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const userName = userData.message?.name || `User ${userId}`;
    const userEmail = userData.message?.email || '';
    console.log(`👤 User details - Name: ${userName}, Email: ${userEmail}`);

    const data = await updateUserStatusService(userId, status);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      // Send targeted notification to the specific user
      const sendUserNotification = (global as any).sendUserNotification;
      if (sendUserNotification) {
        let actionMessage = '';
        switch (status.toLowerCase()) {
          case 'approved':
            actionMessage = `Your account has been approved! Welcome to MunQuest.`;
            break;
          case 'rejected':
            actionMessage = `Your account application has been rejected. Please contact support for more information.`;
            break;
          case 'flagged':
            actionMessage = `Your account has been flagged for review. Please contact support.`;
            break;
          case 'blocked':
            actionMessage = `Your account has been blocked. Please contact support for assistance.`;
            break;
          default:
            actionMessage = `Your account status has been updated to ${status}.`;
        }
        
        const notificationData = {
          message: actionMessage,
          userName: userName,
          userEmail: userEmail,
          status: status,
          timestamp: new Date().toISOString()
        };
        
        console.log(`📤 Sending targeted notification to user ${userId}`);
        sendUserNotification(userId, 'user_status_updated', notificationData);
      } else {
        console.log('❌ Send user notification function not available');
      }
      
      return res.status(200).json({ success: true, message: data.message });
    }
  } catch (error) {
    console.log('Error updating user status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export const updateUserGolbalStatus = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    const data = await updateUserGolbalStatusService(username, email);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({ success: true, message: data.message });
    }
  } catch (error) {
    console.log('Error updating user global status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export const removeUserGolbalStatus = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;
    const data = await removeUserGolbalStatusService(username, email);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      return res.status(200).json({ success: true, message: data.message });
    }
  } catch (error) {
    console.log('Error removing user global status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export const updateUserBySuperUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    console.log(`🔄 Superuser updating user ${userId} with data:`, userData);

    // Get user details before updating for notification
    const userInfo = await getUserByIdService(userId);
    if (userInfo.status === false) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const userName = userInfo.message?.name || `User ${userId}`;
    const userEmail = userInfo.message?.email || '';
    console.log(`👤 User details - Name: ${userName}, Email: ${userEmail}`);

    const data = await updateUserBySuperUserService(userId, userData);
    if (data.status === false) {
      return res.status(400).json({ success: false, message: data.message });
    } else {
      // Send targeted notification to the specific user about profile update
      const sendUserNotification = (global as any).sendUserNotification;
      if (sendUserNotification) {
        let actionMessage = '';
        let notificationType = 'user_profile_updated';
        
        // Check if this is an organiser assignment
        if (userData.globalRole === 'Organiser') {
          actionMessage = `Congratulations! You have been assigned the Organiser role. You now have access to create and manage events. Welcome to the MunQuest organizing team!`;
          notificationType = 'user_assigned_organiser';
        } else {
          actionMessage = `Your profile has been updated by an administrator. Please review your information and contact support if you have any questions.`;
        }
        
        const notificationData = {
          message: actionMessage,
          userName: userName,
          userEmail: userEmail,
          action: userData.globalRole === 'Organiser' ? 'assigned_organiser' : 'profile_updated',
          updatedFields: Object.keys(userData),
          timestamp: new Date().toISOString()
        };
        sendUserNotification(userId, notificationType, notificationData);
      } else {
        console.log('❌ Send user notification function not available');
      }
      
      return res.status(200).json({ success: true, message: data.message });
    }
  } catch (error) {
    console.log('Error updating user by superuser:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
