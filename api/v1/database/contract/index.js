`use strict`;

const sequelize = require(`$home`).sequelize;
const Customer  = require(`$db_v1/customer`).Customer;
const Contract  = sequelize.import(`contract-definition`);

Contract.belongsTo(Customer, {foreignKey: `customerid`});

Contract.Values = {
    default: 0
};

module.exports.Contract = Contract;