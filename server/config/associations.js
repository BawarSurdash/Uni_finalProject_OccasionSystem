// This file manually sets up associations between models

module.exports = (db) => {
    // Make sure all models are loaded
    const { Users, Posts, Booking, Feedback } = db;
    
    // Set up associations
    if (Users && Booking) {
        Users.hasMany(Booking);
        Booking.belongsTo(Users);
    }
    
    if (Posts && Booking) {
        Posts.hasMany(Booking);
        Booking.belongsTo(Posts);
    }
    
    // Set up Feedback associations
    if (Feedback) {
        if (Users) {
            Users.hasMany(Feedback);
            Feedback.belongsTo(Users);
        }
        
        if (Posts) {
            Posts.hasMany(Feedback);
            Feedback.belongsTo(Posts);
        }
        
        if (Booking) {
            Booking.hasMany(Feedback);
            Feedback.belongsTo(Booking);
        }
    }
    
    console.log("Associations set up manually");
}; 