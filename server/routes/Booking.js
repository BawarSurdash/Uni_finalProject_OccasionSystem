const express=require('express');
const router=express.Router();
const {Booking, Users, Posts}=require('../models');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Log incoming requests
router.use((req, res, next) => {
    console.log(`[Booking Route] ${req.method} ${req.path} - Access Token: ${req.header("accessToken") ? "Present" : "Missing"}`);
    next();
});

// Create booking from form submission
router.post('/', validateToken, async(req,res)=>{
    try {
        console.log("User from token:", req.user);
        
        const {eventDate, totalPrice, paymentMethod, phoneNumber, address, serviceId, additionalRequests} = req.body;
        
        // Log data for debugging
        console.log("Creating booking with data:", {
            eventDate, totalPrice, paymentMethod, phoneNumber, address, serviceId
        });
        
        // Create new booking in database with only the fields that exist in the model
        const newBooking = await Booking.create({
            eventDate,
            totalPrice,
            paymentMethod,
            phoneNumber,
            address,
            status: 'pending'
            // Removed userId, postId, and additionalRequirements as they're not in the model
        });
        
        console.log("New booking created:", newBooking.id);
        
        // Try to update the associations manually
        try {
            // Get references to the models
            const { sequelize } = Booking;
            
            // Manually add associations using SQL queries if needed
            if (serviceId) {
                console.log(`Setting PostId=${serviceId} for booking ${newBooking.id}`);
                await sequelize.query(
                    'UPDATE Bookings SET PostId = ? WHERE id = ?',
                    { replacements: [serviceId, newBooking.id] }
                );
            }
            
            // Add user association
            console.log(`Setting UserId=${req.user.id} for booking ${newBooking.id}`);
            await sequelize.query(
                'UPDATE Bookings SET UserId = ? WHERE id = ?',
                { replacements: [req.user.id, newBooking.id] }
            );
            
            console.log("Associations updated successfully");
        } catch (assocError) {
            console.error("Error setting associations:", assocError);
            // Continue even if associations fail
        }
        
        res.status(201).json({ 
            success: true, 
            message: "Booking created successfully", 
            booking: newBooking 
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create booking", 
            error: error.message 
        });
    }
});

// Get all bookings for the logged-in user
router.get('/', validateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        console.log("Fetching bookings for user ID:", userId);
        
        // Find all bookings for this user with associated post details
        const bookings = await Booking.findAll({
            where: { UserId: userId },
            include: [
                { 
                    model: Posts,
                    attributes: ['id', 'title', 'category', 'image', 'basePrice'] 
                },
                {
                    model: Users,
                    attributes: ['id', 'username', 'email'] // Include user information
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific booking by ID
router.get('/:id', validateToken, async(req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
        
        // Find the booking with associated post details
        const booking = await Booking.findOne({
            where: { 
                id: bookingId,
                UserId: userId  // Ensure the booking belongs to this user
            },
            include: [
                { 
                    model: Posts,
                    attributes: ['id', 'title', 'category', 'image', 'basePrice', 'description'] 
                },
                {
                    model: Users,
                    attributes: ['id', 'username', 'email'] // Include user information
                }
            ]
        });
        
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        res.json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel a booking
router.put('/cancel/:id', validateToken, async(req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
        
        // Find the booking
        const booking = await Booking.findOne({
            where: { 
                id: bookingId,
                UserId: userId  // Ensure the booking belongs to this user
            }
        });
        
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        // Check if booking is already cancelled or completed
        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: "Booking is already cancelled" });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ error: "Cannot cancel a completed booking" });
        }
        
        // Update the booking status to cancelled
        booking.status = 'cancelled';
        await booking.save();
        
        res.json({ 
            success: true, 
            message: "Booking cancelled successfully", 
            booking 
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get booking statistics
router.get('/stats', validateToken, async(req, res) => {
    try {
        // Get total number of bookings
        const totalBookings = await Booking.count();
        
        // Get completed bookings count
        const completedBookings = await Booking.count({
            where: { status: 'completed' }
        });
        
        // Get pending bookings count
        const pendingBookings = await Booking.count({
            where: { status: 'pending' }
        });
        
        // Get cancelled bookings count
        const cancelledBookings = await Booking.count({
            where: { status: 'cancelled' }
        });
        
        // Get confirmed bookings count
        const confirmedBookings = await Booking.count({
            where: { status: 'confirmed' }
        });
        
        // Return all stats
        res.json({
            totalBookings,
            completedBookings,
            pendingBookings,
            cancelledBookings,
            confirmedBookings
        });
    } catch (error) {
        console.error("Error fetching booking statistics:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update booking status
router.put('/status/:id', validateToken, async(req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: "Invalid status value. Must be one of: pending, confirmed, cancelled, completed" 
            });
        }
        
        // Find the booking
        const booking = await Booking.findByPk(bookingId);
        
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        // Update the booking status
        booking.status = status;
        await booking.save();
        
        res.json({ 
            success: true, 
            message: `Booking status updated to ${status}`, 
            booking 
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports=router;
