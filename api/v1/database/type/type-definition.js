module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`type`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        addition: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        statusTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'ordertype'
    })
}