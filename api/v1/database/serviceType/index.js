`use strict`;

const fs          = require(`fs`);
const sequelize   = require(`$home`).sequelize;
const ServiceType = sequelize.import(`type-definition`);

const query       = {
    getAvailable: fs.readFileSync(db_v1 + `serviceType/query/getAvailable.sql`).toString()
};

ServiceType.Values = {
    repair: 3, // Ремонт
    supply: 9  // Поставка запчастей
};

ServiceType.getAvailable = (id, transaction = null) => {
    return sequelize.query(query.getAvailable,  { replacements: [id], type: sequelize.QueryTypes.SELECT, transaction });
};

module.exports.ServiceType = ServiceType;
