module.exports=(sequelize,DataTypes)=>{
    const Posts=sequelize.define('Posts',{
        title:{
            type:DataTypes.STRING,
            allowNull:false
        },
        description:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        category:{
            type:DataTypes.STRING,
            allowNull:false
        },
        image:{
            type:DataTypes.STRING,
            allowNull:false
        },
        basePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        selectedAddons: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        isSpecial: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        specialFeatures: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    })
    return Posts;
}
