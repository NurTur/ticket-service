`use strict`;

const index         = require(`$home`);
const tinyIntValues = require(`$home`).config.tinyIntValues;

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`contacts`, {
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
            validate: {isInt: {msg: `Contact's typeId value have to be of type INTEGER`}}
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `cityid`,
            validate: {isInt: {msg: `Contact's cityId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `name`,
            validate: {notEmpty: true, msg: `Contact's name have not to be empty`}
        },
        post: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 255], msg: `Contact's post length have to be less then 255 characters`}}
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 255], msg: `Contact's address length have to be less then 255 characters`}}
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `phones`,
            validate: {len: {args: [0, 255], msg: `Contact's phone length have to be less then 255 characters`}}
        },
        email: {
            type: DataTypes.STRING(512),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 512], msg: `Contact's email length have to be less then 512 characters`}}
        },
        iin: {
            type: DataTypes.STRING(12),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 13], msg: `Contact's iin length have to be less then 13 characters`}}
        },
        cardNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `id_card_number`,
            validate: {len: {args: [0, 255], msg: `Contact's cardNumber length have to be less then 255 characters`}}
        },
        cardDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            field: `id_card_date`,
            validate: {isDate: {msg: `Contact's cardDate value type have to be of type DATE`}},
			set(val) {
				this.setDataValue(`cardDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        dispatch: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: `spam_accepted`,
            validate: {
                isInt: {msg: `Contact's active value have to be of type INTEGER`},
                isIn: {args: tinyIntValues, msg: `Contact's active value have to be one of - ` + tinyIntValues}
            }
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'contacts'
    })
}
