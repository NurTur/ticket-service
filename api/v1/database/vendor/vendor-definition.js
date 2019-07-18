const tinyIntValues = require(`$home`).config.tinyIntValues;

module.exports = function(sequelize, DataTypes) {
    const tinyIntValues = [0, 1]
    return sequelize.define(`vendor`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {notEmpty: {msg: `Vendor can't be emty`}}
        },
        appendix: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {notEmpty: {msg: `Vendor can't be emty`}}
        },
        innerFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `inner_vendor`,
            validate: {
                isInt: {msg: `Vendor's innerFlag value have to be of type INTEGER`}},
                isIn: {args: tinyIntValues, msg: `Vendor's innerFlag value have to be one of the values: ` + tinyIntValues},
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'vendors'
    })
}