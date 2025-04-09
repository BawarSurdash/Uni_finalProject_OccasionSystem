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
    return Users;
}
