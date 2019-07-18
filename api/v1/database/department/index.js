`use strict`;

const sequelize  = require(`$home`).sequelize;
const Department = sequelize.import(`department-definition`);

Department.Values = {
    osspts: 1,
    osspko: 2,
    coordinators: 5
}

module.exports.Department = Department;