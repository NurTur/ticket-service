module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`needPart`, {
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
            validate: {isInt: {msg: `NeedPart's ticketId value have to be of type INTEGER`}}
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `owner_id`,
            validate: {isInt: {msg: `NeedPart's userId value have to be of type INTEGER`}}
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `status`,
            validate: {isInt: {msg: `NeedPart's statusId value have to be of type INTEGER`}}
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: `partname`,
            validate: {notEmpty: {msg: `NeedPart's name have not to be empty`}}
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
                min: {args: [1], msg: `NeedPart's quantity value have to be more then 0`}
            }
        },
        unitId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `unitid`,
            validate: {isInt: {msg: `NeedPart's unitId have to be of type INTEGER`}}
        },
        appendTime: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP`),
            field: `append_time`
        },
        perm: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'needparts'
    })
}
