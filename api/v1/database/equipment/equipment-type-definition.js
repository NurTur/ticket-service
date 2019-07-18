module.exports = function(sequelize, DataTypes) {
    const tinyIntValues = [0, 1];

    return sequelize.define(`equipmentType`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vendorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `vendorid`,
            validate: {isInt: {msg: `Equipment's vendorId value have to be of type INTEGER`}}
        },
        model: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            field: `typemodel`  
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: `name`  
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'equipmenttypes'
    })
}