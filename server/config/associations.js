// This file manually sets up associations between models

module.exports = (db) => {
    // Make sure all models are loaded
    const { Users, Posts, Booking } = db;
    
    // Set up associations
    if (Users && Booking) {
        Users.hasMany(Booking);
        Booking.belongsTo(Users);
    }
    
    if (Posts && Booking) {
        Posts.hasMany(Booking);
        Booking.belongsTo(Posts);
    }
    
    console.log("Associations set up manually");
}; 