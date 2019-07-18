`use strict`;

const commentTypeValues = require(`./commentType`);

module.exports = function(sequelize, DataTypes) {
    const typeValues = Object.values(commentTypeValues);

    return sequelize.define(`comment`, {
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
            validate: {isInt: {msg: `Comment's ticketId value have to be of type INTEGER`}}
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `ownerid`,
            validate: {isInt: {msg: `Comment's ownerId value have to be of type INTEGER`}}
        },
        deviceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `device_id`,
            validate: {isInt: {msg: `Comment's deviceId have to be of type INTEGER`}}
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP`),
            field: `commentdate`
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: `comment`,
            validate: {
                // notNull: {msg: `Comment's text have to be specified`},
                len: {args: [4], msg: `Comment's text length have to be more then 4 simbols`}
            }
        },
        type: {
            type: DataTypes.ENUM,
            values: typeValues,
            allowNull: false,
            defaultValue: commentTypeValues.engineer,
            field: `comment_type`,
            validate: {
                isIn: {args: [typeValues], msg: `Comment's type value have to be one of the values: ` + typeValues},
                isString: function(value) {
                    if (!(typeof value === `string`)) {
                        throw new Error(`Comment's type value have to be as STRING`)
                    }
                }
            }
        },
        perm: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // custom validate after all validations
        validate: {
            isDeviceIdRequired: function() {
                if (this.commentType in [commentTypeValues.engineer]) {
                    if (this.deviceId == null) {
                        throw new Error(`Comment's deviceId value have to be specified for commentType:0`)
                    }
                }
            }
        },

        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'comments'
    })
}
