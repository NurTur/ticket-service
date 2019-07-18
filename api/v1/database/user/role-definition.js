module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`role`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            field: `name`
        },
        users: {
            type: DataTypes.BLOB,
            allowNull: true,
            defaultValue: null,
            field: `userslist`
        },
        actions: {
            type: DataTypes.BLOB,
            allowNull: true,
            defaultValue: null,
            field: `actionslist`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'groups'
    })
}