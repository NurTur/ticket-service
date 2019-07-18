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
            field: `current_status_id`
        },
        nextId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `next_status_id`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'needparts_next_status'
    })
}