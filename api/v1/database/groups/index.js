`use strict`;

const sequelize = require(`$home`).sequelize;
const Groups      = sequelize.import(`groups-definition`);

module.exports.Groups = Groups;