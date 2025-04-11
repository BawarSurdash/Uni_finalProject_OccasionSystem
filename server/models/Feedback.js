module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('Feedback', {
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
    
    Feedback.associate = (models) => {
        // A feedback belongs to a user
        Feedback.belongsTo(models.Users);
        // A feedback belongs to a post
        Feedback.belongsTo(models.Posts);
        // A feedback can be associated with a booking
        Feedback.belongsTo(models.Booking);
    };
    
    return Feedback;
}; 