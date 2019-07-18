`use strict`;

const sequelize = require(`$home`).sequelize;
const Vendor    = sequelize.import(`vendor-definition`);

Vendor.values = {
    general: 0
};

module.exports.Vendor = Vendor;