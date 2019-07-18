const index    = require(`$home`);

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`generalPart`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `orderid`,
            validate: {isInt: {msg: `GeneralPart's ticketId value have to be of type INTEGER`}}
        },
        needPartId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `need_part_id`,
            validate: {isInt: {msg: `GeneralPart's needPartId value have to be of type INTEGER`}}
        },
        vendorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `vendor_id`,
            validate: {isInt: {msg: `GeneralPart's vendorId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `partname`,
            validate: {notEmpty: {msg: `GeneralPart's name have not to be empty`}}
        },
        number: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `partnumber`
        },
        substitution: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        blockNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            field: `blocknumber`
        },
        quantity: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isNumeric: true,
                max: 1000,
                min: {args: [1], msg: `GeneralPart's quantity value have to be more then 0`}
            }
        },
        commonFieldString: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
            field: `sordernumber`
        },
        commonField2String: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `pserialnumber`
        },
        commonFieldText: {
            type: DataTypes.TEXT('tiny'),
            allowNull: true,
            defaultValue: null,
            field: `coord_order_number`
        },
        commonTimeStamp: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            field: `coord_order_date`,
			set(val) {
				this.setDataValue(`commonTimeStamp`, index.getValidDate(val, `YYYY-MM-DD HH:MM:SS`));
			}
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `coord_customer_id`,
            validate: {isInt: {msg: `GeneralPart's customerId have to be of type INTEGER`}}
        },
        perm: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'parts'
    })
}
