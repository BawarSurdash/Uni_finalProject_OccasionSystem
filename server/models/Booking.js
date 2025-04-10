module.exports=(sequelize,DataTypes)=>{
    const Booking=sequelize.define('Booking',{
        eventDate:{
            type:DataTypes.DATE,
            allowNull:false
        },
      
        totalPrice:{
            type:DataTypes.DECIMAL(10, 2),
            allowNull:false
        },
        paymentMethod:{
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber:{
            type:DataTypes.STRING,
            allowNull:false
        },
        address:{
            type:DataTypes.STRING,
            allowNull:false
        },
        status:{
            type:DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
            defaultValue: 'pending',
            allowNull:false
        },
        imageProof:{
            type:DataTypes.STRING,
            allowNull:true
        }   
    })
    
    Booking.associate = (models) => {
        // A booking belongs to a user
        Booking.belongsTo(models.Users);
        // A booking belongs to a post
        Booking.belongsTo(models.Posts);
    };
    
    return Booking;
}
