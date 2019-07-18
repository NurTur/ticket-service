module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`city`, {
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
        code: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'city'
    })
}