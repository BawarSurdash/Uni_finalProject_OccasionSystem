module.exports=(sequelize,DataTypes)=>{
    const Users=sequelize.define('Users',{
        username:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        },
            role:{
            type:DataTypes.STRING,
            allowNull:true
        },
       phone:{
        type:DataTypes.STRING,
        allowNull:true
       },
       address:{
        type:DataTypes.STRING,
        allowNull:true
       },
 
  
    })
    Users.associate = (models) => {
        // User can have many bookings
        Users.hasMany(models.Booking, {
            onDelete: "cascade"
        });
        
        // User can have many notifications
        Users.hasMany(models.Notification, {
            onDelete: "cascade"
        });

    
    };   
        
    return Users;
}
