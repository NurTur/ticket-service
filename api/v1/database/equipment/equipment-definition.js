`use strict`;

const index    = require(`$home`);
module.exports = function(sequelize, DataTypes) {
    const tinyIntValues = [0, 1];

    return sequelize.define(`equipment`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `customerid`,
            validate: {isInt: {msg: `Equipment's customerId value have to be of type INTEGER`}}
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `cityid`,
            validate: {isInt: {msg: `Equipment's cityId value have to be of type INTEGER`}}
        },
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `typemodelid`,
            validate: {isInt: {msg: `Equipment's typeId value have to be of type INTEGER`}}
        },
        contractId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `service_contract_id`,
            validate: {isInt: {msg: `Equipment's contractId value have to be of type INTEGER`}}
        },
        location: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            defaultValue: null,
            field: `place`
        },
        regNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `regnumber`
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `serialnumber`
        },
        endCBSWarrantyDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            field: `endcbswarrantydate`,
            validate: {isDate: {msg: `Equipment's endCBSWarrantyDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`endCBSWarrantyDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        endWarrantyDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            field: `endwarrantydate`,
            validate: {isDate: {msg: `Equipment's endWarrantyDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`endWarrantyDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        bnaFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `bna`,
            validate: {isIn: {args: [tinyIntValues], msg: `Equipment's bnaFlag value have to be one of values: ` + tinyIntValues}}
        },
        archivedFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: `archived`,
            validate: {isIn: {args: [tinyIntValues], msg: `Equipment's archivedFlag value have to be one of values: ` + tinyIntValues}}
        },
        updateTime: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
            field: `update_time`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'equipment'
    })
}
