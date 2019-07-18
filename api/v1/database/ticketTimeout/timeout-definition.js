`use strict`;

const index         = require(`$home`);
const tinyIntValues = index.config.tinyIntValues;
const moment        = require(`moment`);

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`timeout`, {
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `order_id`,
            primaryKey: true,
            validate: {isInt: {msg: `Timeout's ticketId value have to be of type INTEGER`}}
        },
        reasonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `reason_id`,
            primaryKey: true,
            validate: {
              isInt: {msg: `Timeout's reasonId value have to be of type INTEGER`}
            }
        },
        timeout: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: `timeout`,
            primaryKey: true,
            validate: {
              isDate: {msg: `Timeout value have to be of type DATE`},
              isAfter: {
                args: [moment().format(`YYYY-MM-DD`)],
                msg: `Срок ожидания не должен быть ранее следующего дня`
              }
            },
            set(val) {
                this.setDataValue(`timeout`, index.getValidDate(val, `YYYY-MM-DD`));
            }
        },
        append: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP`),
            field: `append_time`
        },
        notification: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            field: `notification`,
			set(val) {
				this.setDataValue(`notification`, index.getValidDate(val, `YYYY-MM-DD HH:MM:SS`));
			}
        },
        alert: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            field: `alert`,
			set(val) {
				this.setDataValue(`alert`, index.getValidDate(val, `YYYY-MM-DD HH:MM:SS`));
			}
        },
        activeFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: tinyIntValues[1],
            field: `active`,
            validate: {isIn: {args: [tinyIntValues], msg: `Timeout's activeFlag value have to be one of values: ` + tinyIntValues}}
        },
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'order_timeout'
    })
}
