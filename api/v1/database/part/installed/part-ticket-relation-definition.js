module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`instPartTTicketRelation`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        instPartId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `instpartid`,
            validate: {isInt: {msg: `InstPartId value have to be of type INTEGER`}}
        },
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `torderid`,
            validate: {isInt: {msg: `InstPart's ticketId value have to be of type INTEGER`}}
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'part_torder'
    })
}
