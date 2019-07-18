module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`instPart`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        type: { // no_order_flag from units
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `part_type`,
            validate: {isInt: {msg: `InstPart's type value have to be of type INTEGER`}}
        },
        needPartId:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: `need_part_id`,
            validate: {isInt: {msg: `InstPart's needPartId value have to be of type INTEGER`}}
        },
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `orderid`,
            validate: {isInt: {msg: `InstPart's ticketId value have to be of type INTEGER`}}
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `userid`,
            validate: {isInt: {msg: `InstPart's userId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `partname`,
            validate: {notEmpty: {msg: `InstPart's name have not to be empty`}}
        },
        number: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `partnumber`
        },
        quantity: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isNumeric: true,
                max: 1000,
                min: {args: [1], msg: `InstPart's quantity value have to be more then 0`}
            }
        },
        unitId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `unitid`,
            validate: {isInt: {msg: `InstPart's unitId have to be of type INTEGER`}}
        },
        appendTime: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP`),
            field: `append_time`
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            field: `comment`,
            validate: {notEmpty: {msg: `Comment's text have to be specified`}}
        },
        perm: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'instparts'
    })
}
