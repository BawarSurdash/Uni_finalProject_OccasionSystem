const express =require('express');
const {Posts, Users, Notification}=require('../models');
const router=express.Router();

router.get('/',async    (req,res)=>{
const listOfPosts=await Posts.findAll();
res.json(listOfPosts);
})

// Get single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Posts.findByPk(req.params.id);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: "Post not found" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/',async (req,res)=>{
    try {
        const post = req.body;
        const createdPost = await Posts.create(post);
        
        // Notify all users about the new post
        try {
            // Get all users
            const users = await Users.findAll({ attributes: ['id'] });
            
            // Create notifications for each user
            const notificationPromises = users.map(user => 
                Notification.create({
                    title: "New Event Available",
                    content: `A new event "${createdPost.title}" is now available! Check it out.`,
                    read: false,
                    UserId: user.id
                })
            );
            
            await Promise.all(notificationPromises);
            console.log(`Notification about new post sent to ${users.length} users`);
        } catch (notifError) {
            console.error("Error creating post notifications:", notifError);
            // Continue even if notification creation fails
        }
        
        res.json(createdPost);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        await Posts.destroy({
            where: { id: req.params.id }
        });
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update post
router.put('/:id', async (req, res) => {
    try {
        const post = await Posts.update(req.body, {
            where: { id: req.params.id }
        });
        const updatedPost = await Posts.findByPk(req.params.id);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports=router;


