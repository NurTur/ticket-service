module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`perm`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        edit: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: `permissions`
    })
}