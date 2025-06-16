import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';

interface NotificationContextType {
  isConnected: boolean;
  notifications: NotificationData[];
  clearNotifications: () => void;
  debugNotifications: () => void;
}

interface NotificationData {
  id: string;
  message: string;
  eventName?: string;
  eventDescription?: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  status?: string;
  userName?: string;
  userEmail?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  type?: string;
  timestamp: string;
  read: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);

  // Generate unique ID with counter to prevent duplicates
  const generateUniqueId = () => {
    setNotificationCounter(prev => prev + 1);
    return `${Date.now()}_${notificationCounter}`;
  };

  // Check if notification already exists to prevent duplicates
  const isDuplicateNotification = (newNotification: Omit<NotificationData, 'id' | 'read'>, currentNotifications: NotificationData[]) => {
    return currentNotifications.some(notification => 
      notification.message === newNotification.message &&
      notification.eventId === newNotification.eventId &&
      Math.abs(new Date(notification.timestamp).getTime() - new Date(newNotification.timestamp).getTime()) < 1000 // Within 1 second
    );
  };

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    
    // Update connection status
    setIsConnected(socket.connected);

    // Listen for connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected successfully');
      
      // Join user to their personal room for targeted notifications
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token) return;
      if (userId) {
        socket.emit('join_user_room', userId);
        console.log(`🔗 Emitting join_user_room for user: ${userId}`);
        console.log(`🔗 Socket ID: ${socket.id}`);
      } else {
        console.log('⚠️ No userId found in localStorage - cannot join user room');
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    // Listen for event creation notifications
    socket.on('event_created', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Event created notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate event created notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Event created notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for event status update notifications
    socket.on('event_status_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Event status updated notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate event status notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Event status updated notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for event deletion notifications
    socket.on('event_deleted', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Event deleted notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate event deleted notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Event deleted notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for event update notifications (general broadcast)
    socket.on('event_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Event updated notification received (general):', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate event updated notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Event updated notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for user-specific notifications
    socket.on('user_status_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 User status notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate user status notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ User status notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for targeted event update notifications for registered users
    socket.on('event_updated_for_registered_users', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Targeted event update notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate targeted event update notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Targeted event update notification processed');
        console.log('📊 Total notifications after adding:', prev.length + 1);
        return [newNotification, ...prev];
      });
    });

    // Listen for leadership role creation notifications
    socket.on('leadership_role_created', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Leadership role created notification received:', data);
      
      // Check if this notification is for the current user
      const currentUserId = localStorage.getItem('userId');
      if (data.targetUserId && data.targetUserId !== currentUserId) {
        console.log('⚠️ Leadership role notification not for current user, ignoring');
        return;
      }
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate leadership role created notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Leadership role created notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for leadership role update notifications
    socket.on('leadership_role_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Leadership role updated notification received:', data);
      
      // Check if this notification is for the current user
      const currentUserId = localStorage.getItem('userId');
      if (data.targetUserId && data.targetUserId !== currentUserId) {
        console.log('⚠️ Leadership role update notification not for current user, ignoring');
        return;
      }
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate leadership role updated notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Leadership role updated notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for leadership role deletion notifications
    socket.on('leadership_role_deleted', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Leadership role deleted notification received:', data);
      
      // Check if this notification is for the current user
      const currentUserId = localStorage.getItem('userId');
      if (data.targetUserId && data.targetUserId !== currentUserId) {
        console.log('⚠️ Leadership role deletion notification not for current user, ignoring');
        return;
      }
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate leadership role deleted notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Leadership role deleted notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for leadership role assignment notifications (from registeration.controller.ts)
    socket.on('leadership_role_assigned', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Leadership role assigned notification received:', data);
      
      // Check if this notification is for the current user
      const currentUserId = localStorage.getItem('userId');
      if (data.targetUserId && data.targetUserId !== currentUserId) {
        console.log('⚠️ Leadership role assignment notification not for current user, ignoring');
        return;
      }
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate leadership role assignment notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Leadership role assignment notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for leadership role removal notifications (from registeration.controller.ts)
    socket.on('leadership_role_removed', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Leadership role removed notification received:', data);
      
      // Check if this notification is for the current user
      const currentUserId = localStorage.getItem('userId');
      if (data.targetUserId && data.targetUserId !== currentUserId) {
        console.log('⚠️ Leadership role removal notification not for current user, ignoring');
        return;
      }
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate leadership role removal notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Leadership role removal notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for committee creation notifications (from event_committe.controller.ts)
    socket.on('committee_created', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Committee created notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate committee created notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Committee created notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for committee update notifications (from event_committe.controller.ts)
    socket.on('committee_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Committee updated notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate committee updated notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Committee updated notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for committee deletion notifications (from event_committe.controller.ts)
    socket.on('committee_deleted', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Committee deleted notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate committee deleted notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Committee deleted notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for agenda creation notifications (from event_committe_agenda.controller.ts)
    socket.on('agenda_created', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Agenda created notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate agenda created notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Agenda created notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for agenda update notifications (from event_committe_agenda.controller.ts)
    socket.on('agenda_updated', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Agenda updated notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate agenda updated notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Agenda updated notification processed');
        return [newNotification, ...prev];
      });
    });

    // Listen for agenda deletion notifications (from event_committe_agenda.controller.ts)
    socket.on('agenda_deleted', (data: Omit<NotificationData, 'id' | 'read'>) => {
      console.log('🔔 Agenda deleted notification received:', data);
      
      setNotifications(prev => {
        // Check for duplicates using current state
        if (isDuplicateNotification(data, prev)) {
          console.log('⚠️ Duplicate agenda deleted notification ignored');
          return prev;
        }

        const newNotification: NotificationData = {
          id: generateUniqueId(),
          ...data,
          read: false
        };

        console.log('✅ Agenda deleted notification processed');
        return [newNotification, ...prev];
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('event_created');
      socket.off('event_status_updated');
      socket.off('event_deleted');
      socket.off('event_updated');
      socket.off('user_status_updated');
      socket.off('event_updated_for_registered_users');
      socket.off('leadership_role_created');
      socket.off('leadership_role_updated');
      socket.off('leadership_role_deleted');
      socket.off('leadership_role_assigned');
      socket.off('leadership_role_removed');
      socket.off('committee_created');
      socket.off('committee_updated');
      socket.off('committee_deleted');
      socket.off('agenda_created');
      socket.off('agenda_updated');
      socket.off('agenda_deleted');
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const debugNotifications = () => {
    console.log('🔍 Notification Debug Info:');
    console.log('Total notifications:', notifications.length);
    console.log('Unread notifications:', notifications.filter(n => !n.read).length);
    console.log('Notifications by type:', notifications.reduce((acc, n) => {
      const type = n.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    console.log('All notifications:', notifications);
  };

  // Clean up old notifications (older than 24 hours) to prevent memory issues
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      setNotifications(prev => 
        prev.filter(notification => 
          new Date(notification.timestamp) > oneDayAgo
        )
      );
    };

    // Clean up every hour
    const interval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);
    
    // Initial cleanup
    cleanupOldNotifications();

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    isConnected,
    notifications,
    clearNotifications,
    debugNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
