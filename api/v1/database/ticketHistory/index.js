`use strict`;

const cloner      = require(`cloner`);
const sequelize   = require(`$home`).sequelize;
const User        = require(`$db_v1/user`).User;
const Status      = require(`$db_v1/status`).Status;
const ServiceType = require(`$db_v1/serviceType`).ServiceType;
const History     = sequelize.import(`history-definition`);

History.belongsTo(Status, {foreignKey: `statusid`});
History.belongsTo(User, {as: `performer`, foreignKey: `performerid`});
History.belongsTo(User, {as: `owner`, foreignKey: `ownerid`});
History.belongsTo(ServiceType, {foreignKey: `servicetypeid`});

const historyParams = {
    attributes: [`date`],
    include: [
        {model: Status},
        {model: User, as: `performer`, attributes: [`name`]},
        {model: User, as: `owner`, attributes: [`name`]},
        {model: ServiceType, attributes: [`name`]}
    ],
    order: [[`date`, `ASC`]]
};

History.getAll = (ticketId => {
    return History.findAll(cloner.deep.merge({where: {ticketId}}, historyParams));
});

History.getClosed = (ticketId => {
    return History.findOne(cloner.deep.merge({
        include: [{required: true, where: {final: 1}}],
        where: {ticketId}
    }, historyParams));
});

History.transactionAddHistory = ((data, t) => {
    return History.create(data, {transaction: t});
});

module.exports.History = History;