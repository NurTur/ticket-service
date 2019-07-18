`use strict`;

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`timeoutReason`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: `name`,
            validate: {notEmpty: {msg: `Timeout's reason name value have not to be empty`}}
        },
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'order_timeout_reason'
    })
}