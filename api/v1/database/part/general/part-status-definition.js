module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`status`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 0,
            field: `name`
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        index: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `s_index`
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'partstatustype'
    })
}