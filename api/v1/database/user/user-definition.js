module.exports = function(sequelize, DataTypes) {
    return sequelize.define(`user`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        deputyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `deputy_id`
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `city_id`
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
            field: `name`
        },
        login: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            field: `username`
        },
        password: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            field: `password`
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `departmentid`
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        blocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        hash: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'users'
    })
}