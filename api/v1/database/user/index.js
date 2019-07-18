`use strict`;

const fs         = require('fs');
const Sequelize  = require(`sequelize`);
const sequelize  = require(`$home`).sequelize;
const User       = sequelize.import(`user-definition`);
const Role       = sequelize.import(`role-definition`);
const City       = require(`$db_v1/city`).City;
const Department = require(`$db_v1/department`).Department;
const index      = require(`$home`)
const logger     = index.logger;

const query     = {
    getUserRole  : fs.readFileSync(db_v1 + `user/query/getUserRole.sql`).toString(),
    getUserRoleId: fs.readFileSync(db_v1 + `user/query/getUserRoleId.sql`).toString()
};

User.belongsTo(City, {foreignKey: `city_id`});
User.belongsTo(Department, {foreignKey: `departmentid`});

User.RoleValues = {
    noUser           : -1, // when userId is null in User.getUserRole
    unset            : 0,  // when no role specified for userId
    director         : 1,
    engineer         : 2,
    headOfDepartment : 3,
    seniorEngineer   : 4,
    coordinator      : 5,
    seniorCoordinator: 6,
    administrator    : 7,
    regionalManager  : 8
};

const managers = {
    ids: [],
    roleChecksum: ``
}

// получение массива идентификаторов пользователей из групп 1, 2 и 3 (Админы и руководители)
async function getManagers() {
    const checksum = (await index.getTableCheckSum(Role)).Checksum

    if (!(managers.roleChecksum && managers.roleChecksum === checksum)) {
        managers.roleChecksum = checksum
        managers.ids = (await Role.findAll({attributes: [`users`], where: {id: {$in: [1, 2, 3]}}, raw: true}))
        .reduce((result, row) => {
            return result.concat(...row.users.toString('utf8').split(`,`))
        }, [])
    }

    return managers.ids
}

User.getUserRole = (async (userId, transaction = null) => {
    logger.info(`User.getUserRole`);
    let role;

    if (userId) {
        const roles = await sequelize.query(query.getUserRole, {replacements: {userId}, type: Sequelize.QueryTypes.SELECT, raw: true, transaction}); // Set raw to true if you don't have a model definition for your query.
        
        role = (roles[0].role !== null) ? roles[0].role : User.RoleValues.unset;
    } else {
        role = User.RoleValues.noUser;
    };

    logger.debug(`role: ${role}`);
    
    return role;
});

User.getUserRoleId = (async role => {
    logger.info(`User.getUserRoleId`);
    let roleId = null;

    if (role) {
        const roles = await sequelize.query(query.getUserRoleId, {replacements: {role}, type: Sequelize.QueryTypes.SELECT, raw: true}); // Set raw to true if you don't have a model definition for your query.
        
        roleId = (roles.length > 0) ? roles[0].id : null;
    };

    logger.debug(`roleId: ${roleId}`);
    
    return roleId;
});

User.autorize = (async (login, password) => {
    let user = await User.findOne({
        attributes: {
            exclude: [`password`, `blocked`, `deputyId`, `hash`, `city_id`, `departmentid`]
        },
        include: [
            {model: City},
            {model: Department}
        ],
        where:{
            login, 
            password,
            blocked: false
        }
    })

    if (user) {
        user = index.getPlainData(user)
        user.weight = await User.getUserRole(user.id)
    }

    return user
});

User.getByParams = async ctxQuery => {
    logger.info(`User.getByParams`)

    const where = {blocked: 0}
        
    where.name = ctxQuery.name
        ? {$and: [
                {$like: `%${ctxQuery.name.toLowerCase()}%`},
                {$ne: `Administrator`}
        ]}
        : {$ne: `Administrator`}

    if (ctxQuery.departmentId) {
        where.departmentId = ctxQuery.departmentId
    }

    if (ctxQuery.cityId) {
        where.cityId = ctxQuery.cityId
    }
    
    if (ctxQuery.managers && ctxQuery.managers == `false`) {
        const ids = await getManagers()

        if (ids.length > 0) {
            where.id = {
                $notIn: ids
            }
        }
    }

    return User.findAll({
        attributes: [`id`, `name`],
        where,
        order: [`name`]
    })
}

module.exports.User = User;
module.exports.Role = Role;