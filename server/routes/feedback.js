const express = require('express');
const router = express.Router();
const { Feedback, Users, Posts, Booking } = require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Submit feedback
router.post('/', validateToken, async (req, res) => {
    try {
        const { rating, comment, postId } = req.body;
        
        if (!rating || !postId) {
            return res.status(400).json({ 
                success: false, 
                message: "Rating and post ID are required"
            });
        }
        
        // Check if post exists
        const post = await Posts.findByPk(postId);
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found"
            });
        }
        
        // Create feedback
        const newFeedback = await Feedback.create({
            rating,
            comment,
            UserId: req.user.id,
            PostId: postId
        });
        
        // Try to find a booking related to this post by this user
        const booking = await Booking.findOne({
            where: {
                UserId: req.user.id,
                PostId: postId
            }
        });
        
        // If booking found, associate feedback with it
        if (booking) {
            await newFeedback.setBooking(booking);
        }
        
        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback: newFeedback
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            error: error.message
        });
    }
});

// Get all feedback for the admin dashboard
router.get('/all', async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Posts,
                    attributes: ['id', 'title', 'category', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching all feedback:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all feedback for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        
        const feedbacks = await Feedback.findAll({
            where: { PostId: postId },
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get feedback by star rating for a post
router.get('/post/:postId/stars/:rating', async (req, res) => {
    try {
        const postId = req.params.postId;
        const rating = parseInt(req.params.rating);
        
        // Validate rating parameter
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Rating must be between 1 and 5" 
            });
        }
        
        const feedbacks = await Feedback.findAll({
            where: { 
                PostId: postId,
                rating: rating 
            },
            include: [
                {
                    model: Users,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback by rating:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get feedback statistics for a post
router.get('/post/:postId/stats', async (req, res) => {
    try {
        const postId = req.params.postId;
        
        // Get all feedback for the post
        const feedbacks = await Feedback.findAll({
            where: { PostId: postId }
        });
        
        // Calculate statistics
        const totalFeedbacks = feedbacks.length;
        const stats = {
            totalCount: totalFeedbacks,
            averageRating: 0,
            starCounts: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            }
        };
        
        // Count feedbacks by star rating
        let ratingSum = 0;
        feedbacks.forEach(feedback => {
            const rating = parseInt(feedback.rating);
            ratingSum += rating;
            stats.starCounts[rating] = (stats.starCounts[rating] || 0) + 1;
        });
        
        // Calculate average rating
        stats.averageRating = totalFeedbacks > 0 ? (ratingSum / totalFeedbacks).toFixed(1) : 0;
        
        // Calculate percentages for each star
        for (let i = 1; i <= 5; i++) {
            const count = stats.starCounts[i] || 0;
            stats.starCounts[i] = {
                count: count,
                percentage: totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0
            };
        }
        
        res.json(stats);
    } catch (error) {
        console.error("Error fetching feedback statistics:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all feedback from a user
router.get('/user', validateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const feedbacks = await Feedback.findAll({
            where: { UserId: userId },
            include: [
                {
                    model: Posts,
                    attributes: ['id', 'title', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(feedbacks);
    } catch (error) {
        console.error("Error fetching user feedback:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
