`use strict`;

const cloner     = require(`cloner`);
const logger     = require(`$home`).logger;
const sequelize  = require(`$home`).sequelize;
const Permission = sequelize.import(`permission-definition`);

Permission.getPerms = (async (id, params, Model) => {
    logger.info(`Perm.getPerms`);
    logger.debug(`Search id: ${id}, model: ${Model.name}`);

    const search   = cloner.deep.merge({where: {id}}, params);
    const _result = await Model.findOne(search);
    
    logger.debug(`Result:`);

    if (_result) {
        const result  = _result.get({plain: true}); // If plain is true, then sequelize will only return the first
                                                    // record of the result set. In case of false it will all records.
        logger.debug(result);
        return result;
    } else {
        logger.debug(_result);
        throw new sequelize.ValidationError(`${Model.name} not found`);
    };
});

module.exports.Perm = Permission;