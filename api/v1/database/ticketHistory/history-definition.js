`use strict`;

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`ticketHistory`, {
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
            validate: {isInt: {msg: `Ticket's history ticketId value have to be of type INTEGER`}}
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `statusid`,
            validate: {isInt: {msg: `Ticket's history statusId value have to be of type INTEGER`}}
        },
        serviceTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `servicetypeid`,
            validate: {isInt: {msg: `Ticket's history serviceTypeId value have to be of type INTEGER`}}
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `ownerid`,
            validate: {isInt: {msg: `Ticket's history ownerId value have to be of type INTEGER`}}
        },
        performerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `performerid`,
            validate: {isInt: {msg: `Ticket's history performerId value have to be of type INTEGER`}}
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal(`CURRENT_TIMESTAMP`),
            field: `statustime`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'orderstatus'
    })
}
