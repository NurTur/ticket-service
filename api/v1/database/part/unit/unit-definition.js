module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`unit`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vendorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `vendorid`
        },
        deviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `deviceid`
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: `name`
        },
        noOrderFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `no_order_flag`
        },
        
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'partnames'
    })
}