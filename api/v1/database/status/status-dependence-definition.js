module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`rules`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        currentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `current_id`
        },
        nextId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `next_id`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'ticket_next_status'
    })
}