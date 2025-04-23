const express = require('express');
const { Users } = require("../models");
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sign, verify } = require('jsonwebtoken');

router.post ('/',async    (req,res)=>{
    const {username,email,password}=req.body;
    bcrypt.hash(password,10).then((hash)=>{
        Users.create({
            username:username,
            email:email,
            password:hash
        })  
        res.json("user created");    
    })
   
})
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Consider generating a JWT token here instead of simple message
        const accessToken=sign({username:user.username,id:user.id},"secret");
        res.status(200).json({ 
            message: "Login successful",
            token: accessToken,
            id: user.id
            
        });
        
    } catch (error) {
        console.error("Login error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

router.get('/user', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        const decoded = verify(token, "secret");
        const user = await Users.findByPk(decoded.id, {
            attributes: ['id', 'username', 'email', 'role']
        });
        
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// Add profile endpoint to get user profile including role
router.get('/profile', async (req, res) => {
    try {
        const token = req.header("accessToken");
        if (!token) return res.status(401).json({ error: "Not authenticated" });
        
        const decoded = verify(token, "secret");
        const user = await Users.findByPk(decoded.id, {
            attributes: ['id', 'username', 'email', 'role', 'phone', 'address', 'createdAt']
        });
        
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json(user);
    } catch (error) {
        console.error("Profile error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

// Add set-admin endpoint to grant admin privileges
router.get('/set-admin/:username', async (req, res) => {
    try {
        // Get authorization token
        const token = req.header("accessToken") || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Not authenticated" });
        
        // Verify the token and get the requesting user
        const decoded = verify(token, "secret");
        const requestingUser = await Users.findByPk(decoded.id, {
            attributes: ['id', 'username', 'role']
        });
        
        // Check if the requesting user is a Super Admin - only Super Admins can change roles
        if (!requestingUser || requestingUser.role?.toLowerCase() !== 'super admin') {
            return res.status(403).json({ error: "Access denied. Only Super Admins can change user roles." });
        }
        
        const username = req.params.username;
        const user = await Users.findOne({ where: { username } });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Don't allow promoting yourself for security reasons
        if (user.id === requestingUser.id) {
            return res.status(400).json({ error: "You cannot change your own role" });
        }
        
        user.role = "Admin";
        await user.save();
        
        res.json({ 
            success: true, 
            message: `User ${username} has been granted admin privileges`,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Set admin error:", error);
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "Invalid token" });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// Add new endpoint to set any role (Super Admin only)
router.post('/set-role/:username', async (req, res) => {
    try {
        // Get authorization token
        const token = req.header("accessToken") || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Not authenticated" });
        
        // Verify the token and get the requesting user
        const decoded = verify(token, "secret");
        const requestingUser = await Users.findByPk(decoded.id, {
            attributes: ['id', 'username', 'role']
        });
        
        // Check if the requesting user is a Super Admin
        if (!requestingUser || requestingUser.role?.toLowerCase() !== 'super admin') {
            return res.status(403).json({ error: "Access denied. Only Super Admins can change user roles." });
        }
        
        const { newRole } = req.body;
        if (!newRole) {
            return res.status(400).json({ error: "New role is required" });
        }
        
        // Validate role - only allow User and Admin roles to be set via API
        const validRoles = ['User', 'Admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }
        
        const username = req.params.username;
        const user = await Users.findOne({ where: { username } });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Don't allow changing your own role
        if (user.id === requestingUser.id) {
            return res.status(400).json({ error: "You cannot change your own role" });
        }
        
        // Don't allow changing the role of another Super Admin
        if (user.role?.toLowerCase() === 'super admin') {
            return res.status(403).json({ error: "Cannot change the role of a Super Admin" });
        }
        
        user.role = newRole;
        await user.save();
        
        res.json({ 
            success: true, 
            message: `User ${username} has been assigned the role of ${newRole}`,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Set role error:", error);
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ error: "Invalid token" });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// Get all users (Admin and Super Admin only)
router.get('/users', async (req, res) => {
    try {
        const token = req.header("accessToken");
        if (!token) return res.status(401).json({ error: "Not authenticated" });
        
        const decoded = verify(token, "secret");
        
        // Get the requesting user to check if they are an admin
        const requestingUser = await Users.findByPk(decoded.id, {
            attributes: ['id', 'username', 'role']
        });
        
        // Case-insensitive check for admin or super admin role
        if (!requestingUser || 
            !(requestingUser.role?.toLowerCase() === 'admin' || 
              requestingUser.role?.toLowerCase() === 'super admin')) {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        // Add role information to the response
        const isSuperAdmin = requestingUser.role?.toLowerCase() === 'super admin';
        
        // Fetch all users
        const users = await Users.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });
        
        res.json({
            users: users,
            currentUserRole: requestingUser.role,
            isSuperAdmin: isSuperAdmin
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

// Simple test endpoint to get all users (for debugging)
router.get('/test-users', async (req, res) => {
    try {
        console.log("Test users endpoint called");
        
        // Fetch all users
        const users = await Users.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });
        
        console.log(`Found ${users.length} users`);
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error("Error in test-users endpoint:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

module.exports=router;