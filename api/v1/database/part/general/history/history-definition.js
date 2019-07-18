const index = require(`$home`)

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`history`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        partId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `partid`,
            validate: {isInt: {msg: `Part's status history partId value have to be of type INTEGER`}}
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `partstatustypeid`,
            validate: {isInt: {msg: `Part's history statusId value have to be of type INTEGER`}}
        },
        date: { 
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: `statusdate`,
            defaultValue: index.getValidDate(null, `YYYY-MM-DD`, true),
            validate: {isDate: {msg: `Part's status history date value have to be of type DATE`}}
        },
        quantity: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: null,
            validate: {
                isNumeric: true,
                max: 1000,
                min: {args: [1], msg: `Part's status history quantity value have to be more then 0`}
            }
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'partstatus'
    })
}