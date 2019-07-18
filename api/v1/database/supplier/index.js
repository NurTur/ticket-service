`use strict`;

const sequelize = require(`$home`).sequelize;
const Supplier  = sequelize.import(`supplier-definition`);

module.exports.Supplier = Supplier;