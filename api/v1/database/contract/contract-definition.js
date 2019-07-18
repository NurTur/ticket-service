`use strict`;

const index    = require(`$home`);
module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`contract`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `contracttypeid`,
            validate: {isInt: {msg: `Contract's typeId value have to be of type INTEGER`}}
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `customerid`,
            validate: {isInt: {msg: `Contract's customerId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: `startdate`,
            validate: {isDate: {msg: `Contract's startDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`startDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: `enddate`,
            validate: {isDate: {msg: `Contract's endDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`endDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'contract'
    })
}
