`use strict`;

const sequelize = require(`$home`).sequelize;
const Device     = sequelize.import(`device-definition`);

module.exports.Device = Device;