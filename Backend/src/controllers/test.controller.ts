import { Request, Response } from 'express';

export const testDirectMessage = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sendUserNotification = (global as any).sendUserNotification;
        
        if (sendUserNotification) {
            const testData = {
                message: `Test direct message to user ${userId}`,
                userName: `Test User ${userId}`,
                status: 'test',
                timestamp: new Date().toISOString()
            };
            
            console.log(`🧪 Testing direct message to user ${userId}`);
            sendUserNotification(userId, 'user_status_updated', testData);
            
            return res.status(200).json({
                success: true,
                message: `Test direct message sent to user ${userId}`
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Send user notification function not available'
            });
        }
    } catch (error) {
        console.log('Error testing direct message:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
