module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.Users, {
            onDelete: "cascade"
        });
    };

    return Notification;
};
