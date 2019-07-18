`use strict`;

const cloner      = require(`cloner`)
const index       = require(`$home`)
const sequelize   = index.sequelize
const logger      = index.logger
const Status      = require(`$db_v1/part/general`).Status
const Ticket      = require(`$db_v1/ticket`).Ticket
const History     = sequelize.import(`history-definition`)

History.belongsTo(Status, {foreignKey: `partstatustypeid`})

const historyParams = {
    attributes: {
        exclude: [`partstatustypeid`]
    },
    include: [
        {model: Status, attributes: [`name`]}
    ],
    order: [[`date`, `ASC`], [`id`, `ASC`]]
}

const getPartId = async id => {
    const history = await History.findById(id, {attributes: [`partId`], plain: true})

    if (!history) {
        throw new sequelize.ValidationError(`PartHistory's item not found`)
    }

    return history.partId
}

const getTicketId = async partId => {
    const Part = require(`$db_v1/part/general`).GeneralPart
    const part = await Part.findById(partId, {attributes: [`ticketId`], plain: true})

    if (!part) {
        throw new sequelize.ValidationError(`Part not found`)
    }

    return part.ticketId
}

const checkPermissions = async (partId, userId) => {
    const ticketId = await getTicketId(partId)
    const access = await Ticket.getTicketPerms(ticketId, userId)
    
    if (access.perm.partOrder.generalPart.addition != 1) {
        throw new sequelize.ValidationError(`Permission is denied`)
    }
    return
}

const checkHistoryAvailabilityAndPermissions = async (id, userId) => {
    const partId = await getPartId(id)
    return checkPermissions(partId, userId)
}

History.getAll = partId =>
    History.findAll(cloner.deep.merge({where: {partId}}, historyParams))
History.getById = async id =>
    History.findOne(cloner.deep.merge({where: {id}}, historyParams))

History.tryCreate = async data => {
    const {partId, userId} = data
    logger.info(`partHistory.tryCreate`)

    await checkPermissions(partId, userId)
    
    return History.create(data)
}

History.tryUpdate = (async data => {
    logger.info(`partHistory.tryUpdate`)
    const {id, userId} = data
    
    await checkHistoryAvailabilityAndPermissions(id, userId)

    return History.update(data, {where: {id}, fields: [
        `statusId`,
        `date`,
        `quantity`,
        `comment`
    ]})
});

History.tryDelete = (async data => {
    logger.info(`partHistory.tryDelete`)
    const {id, userId} = data
    
    await checkHistoryAvailabilityAndPermissions(id, userId)
    
    return History.destroy({where: {id}}, {force: true})
})

History.transactionAddHistory = (data, t) =>
    History.create(data, {transaction: t})

History.transactionDeleteAllHistory = (partId, t) =>
    History.destroy({where: {partId}}, {force: true, transaction: t})

module.exports.History = History