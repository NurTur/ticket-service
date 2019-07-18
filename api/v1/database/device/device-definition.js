module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`device`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: `name`
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `parent_id`
        },
        vendorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `vendor_id`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'devices'
    })
}