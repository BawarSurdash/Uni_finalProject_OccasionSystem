const express =require('express');
const {Users}=require('../models');
const router=express.Router();
const bcrypt=require('bcryptjs');
const {sign, verify}=require('jsonwebtoken');

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
            attributes: ['id', 'username', 'email']
        });
        
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});



module.exports=router;