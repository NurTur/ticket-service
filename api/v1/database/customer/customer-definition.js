module.exports = function(sequelize, DataTypes) {
    const allowedValues = [0, 1]
    return sequelize.define(`customer`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `customertypeid`,
            validate: {isInt: {msg: `Customer's typeId value have to be of type INTEGER`}}
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `city_id`,
            validate: {isInt: {msg: `Customer's cityId value have to be of type INTEGER`}}
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `cbs_user_id`,
            validate: {isInt: {msg: `Customer's cbsUserId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `name`,
            validate: {notEmpty: true, msg: `Customer's name have not to be empty`}
        },
        address: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 150], msg: `Customer's address length have to be less then 150 characters`}}
        },
        rnn: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 50], msg: `Customer's rnn length have to be less then 50 characters`}}
        },
        bik: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 50], msg: `Customer's bik length have to be less then 50 characters`}}
        },
        rs: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 50], msg: `Customer's rs length have to be less then 50 characters`}}
        },
        bank: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
            validate: {len: {args: [0, 100], msg: `Customer's bank length have to be less then 100 characters`}}
        },
        sellerFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `seller`,
            validate: {
                isInt: {msg: `Customer's sellerFlag have to be of type INTEGER`},
                isIn: {args: allowedValues, msg: `Customer's sellerFlag value have to be one of - ` + allowedValues}
            }
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isInt: {msg: `Customer's active value have to be of type INTEGER`},
                isIn: {args: allowedValues, msg: `Customer's active value have to be one of - ` + allowedValues}
            }
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'customers'
    })
}