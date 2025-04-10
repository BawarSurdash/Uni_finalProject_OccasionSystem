const express = require('express');
const router = express.Router();
const { Notification, Users } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        
        if (!title || !content || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const newNotification = await Notification.create({
            title,
            content,
            read: false,
            UserId: userId
        });
        
        res.status(201).json({
            success: true,
            notification: newNotification
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all notifications for the logged-in user
router.get('/user', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });
        
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get unread notification count for the logged-in user
router.get('/user/unread-count', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const count = await Notification.count({
            where: { 
                UserId: userId,
                read: false
            }
        });
        
        res.json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: error.message });
    }
});

// Mark a notification as read
router.put('/:id/read', validateToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        
        // Find the notification
        const notification = await Notification.findOne({
            where: { 
                id: notificationId,
                UserId: userId
            }
        });
        
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        
        // Update the notification
        notification.read = true;
        await notification.save();
        
        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read for the logged-in user
router.put('/user/mark-all-read', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Update all unread notifications for this user
        await Notification.update(
            { read: true },
            { where: { 
                UserId: userId,
                read: false
            }}
        );
        
        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: error.message });
    }
});

// Create notifications for all users (typically for system-wide announcements)
router.post('/broadcast', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Get all users
        const users = await Users.findAll({ attributes: ['id'] });
        
        // Create notifications for each user
        const notificationPromises = users.map(user => 
            Notification.create({
                title,
                content,
                read: false,
                UserId: user.id
            })
        );
        
        await Promise.all(notificationPromises);
        
        res.status(201).json({
            success: true,
            message: `Notification broadcast to ${users.length} users`
        });
    } catch (error) {
        console.error("Error broadcasting notification:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all notifications (admin only)
router.get('/admin', validateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        // Get all notifications with user details
        const notifications = await Notification.findAll({
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a notification (admin only)
router.delete('/:id', validateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        const notificationId = req.params.id;
        
        // Delete the notification
        const result = await Notification.destroy({
            where: { id: notificationId }
        });
        
        if (result === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }
        
        res.json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: error.message });
    }
});

// Batch delete notifications (admin only)
router.post('/batch-delete', validateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid notification IDs" });
        }
        
        // Delete the notifications
        const result = await Notification.destroy({
            where: { id: ids }
        });
        
        res.json({
            success: true,
            message: `${result} notification(s) deleted successfully`
        });
    } catch (error) {
        console.error("Error batch deleting notifications:", error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle notification read status (admin only)
router.put('/:id/toggle-read', validateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        const notificationId = req.params.id;
        const { read } = req.body;
        
        // Find the notification
        const notification = await Notification.findByPk(notificationId);
        
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        
        // If read status is provided in body, use that value, otherwise toggle current value
        notification.read = read !== undefined ? read : !notification.read;
        await notification.save();
        
        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error("Error toggling notification read status:", error);
        res.status(500).json({ error: error.message });
    }
});

// Batch update notification read status (admin only)
router.post('/batch-update-read', validateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        const { ids, read } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0 || read === undefined) {
            return res.status(400).json({ error: "Invalid parameters" });
        }
        
        // Update all notifications in the list
        const result = await Notification.update(
            { read },
            { where: { id: ids } }
        );
        
        res.json({
            success: true,
            message: `${result[0]} notification(s) updated successfully`
        });
    } catch (error) {
        console.error("Error batch updating notification status:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
