`use strict`;

const sequelize = require(`$home`).sequelize;
const City      = sequelize.import(`city-definition`);

module.exports.City = City;