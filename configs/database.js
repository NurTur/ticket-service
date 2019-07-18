const logger = require(`../index`).logger

const log = function(message, time) {
    logger.debug(`Sequelize logging:`);
    if (time !== undefined) {
        logger.debug(message, `${time}ms`);
    } else {
        logger.debug(message);
    }
};

const Sequelize = require(`sequelize`);
const sequelize = new Sequelize(`cbsorders`, `ts`, `1rEHtfTEfO53d3dU`, {
    host: `127.0.0.1`,
    dialect: `mysql`,
    timezone: `+06:00`,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        handleDisconnect: true
    },

    logging: log,
    benchmark: true
});

module.exports = sequelize;