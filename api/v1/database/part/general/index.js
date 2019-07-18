`use strict`;

const cloner           = require(`cloner`);
const Sequelize        = require(`sequelize`);
const index            = require(`$home`);
const sequelize        = index.sequelize;
const logger           = index.logger;
const Customer         = require(`$db_v1/customer`).Customer;
const Vendor           = require(`$db_v1/vendor`).Vendor;
const User             = require(`$db_v1/user`).User;
const Ticket           = require(`$db_v1/ticket`).Ticket;
const TicketStatus     = require(`$db_v1/status`).Status;
const ticketTypeValues = require(`$db_v1/type`).ticketTypeValues;
const GeneralPart      = sequelize.import(`part-general-definition`);
const Status           = sequelize.import(`part-status-definition`);

Status.Values = {
    requested: 10, // Запрос
    cancelled: 12 // Отменено
}
module.exports.Status = Status

const PartHistory = require(`./history`).History

GeneralPart.belongsTo(Customer, {foreignKey: `coord_customer_id`});
GeneralPart.belongsTo(Vendor, {foreignKey: `vendor_id`});
GeneralPart.belongsTo(Ticket, {foreignKey: `ticketId`});

const baseParams = {
    attributes: {
        exclude: [`vendor_id`, `coord_customer_id`, `need_part_id`]
    },
    include: [
        {
            model: Customer,
            attributes: [`id`, `name`]
        },
        {
            model: Vendor,
            attributes: [`id`, `name`]
        }
    ],
    order: [[`id`, `ASC`]]
};

GeneralPart.getAll = async ticketId => {
    const ticket = await Ticket.findById(ticketId, {attributes: [`typeId`]})

    if (ticket == null) {
        return null;
    }
    logger.trace(`ticket: `, ticket.get({plain:true}));

    switch (ticket.get(`typeId`)) {
        case ticketTypeValues.M:
        case ticketTypeValues.R:
        case ticketTypeValues.S:
            return getChildrenParts(ticketId);
            break;
        case ticketTypeValues.Q:
        case ticketTypeValues.P:
        case ticketTypeValues.L:
            return getTicketParts(ticketId);
            break;
        default:
            return null;
    }
};
GeneralPart.getByNeedPartID = async needPartId => {
	const search = cloner.deep.copy(baseParams);
    search.where = {needPartId}

	return GeneralPart.findOne(search)
}
GeneralPart.getById = (async id => {
    const search = cloner.deep.merge({where: {id}}, baseParams)
    return GeneralPart.findOne(search)
})
// получение generalParts со всех дочерних заявок для отображения
const getChildrenParts = (parentId => {
    const search = cloner.deep.copy(baseParams);
    search.include.push({
        model: Ticket,
        attributes: [],
        where: {parentId}
    });

    return GeneralPart.findAll(search);
});

// получение generalParts по заявке для обработки
const getTicketParts = async ticketId => {
    const search = cloner.deep.merge({where: {ticketId}}, baseParams)

    return GeneralPart.findAll(search)
};

GeneralPart.tryCreate = async data => {
    const result = {}
    const {ticketId, userId} = data

    logger.info(`GeneralPart.tryCreate`);
    const access = await Ticket.getTicketPerms(ticketId, userId)
    if (access.perm.partOrder.generalPart.addition != 1) {
        throw new sequelize.ValidationError(`Permission is denied`)
    }
    await sequelize.transaction(async t => {
        result.createPart = await GeneralPart.transactionCreatePart(data, t)
        logger.trace(result.createPart.get({plain: true}))
        if (!result.createPart) {
            const msg = `Could not create general part`
            throw new sequelize.ValidationError(msg)
        }

        // реализовано в триггере БД PartsAfterInsert,
        // раскомментить после полного перехода на web и удаления триггера
        // const history = {
        //     partId: result.createPart.get(`id`),
        //     statusId: Status.Values.requested,
        //     quantity: result.createPart.get(`quantity`)
        // }
        // result.createPartHistory = await PartHistory.transactionAddHistory(history, t)
    })
    return result
}

GeneralPart.tryUpdate = (async data => {
    logger.info(`tryUpdate - `)
    const {id, userId} = data
    const part = await GeneralPart.findById(id, {attributes: [`ticketId`], plain: true})

    if (!part) {
        throw new sequelize.ValidationError(`Part not found`)
    }

    const access = await Ticket.getTicketPerms(part.ticketId, userId)
    if (access.perm.partOrder.generalPart.editing != 1) {
        throw new sequelize.ValidationError(`Permission is denied`)
    }

    return GeneralPart.update(data, {where: {id}, fields: [
        `vendorId`,
        `name`,
        `number`,
        `quantity`,
        `commonFieldText`,
        `commonTimeStamp`,
        `customerId`,
        `substitution`,
        `commonFieldString`
    ]});
});

GeneralPart.tryDelete = (async data => {
    logger.info(`tryDelete - `)
    const {id, userId} = data
    const part = await GeneralPart.findById(id, {attributes: [`ticketId`], plain: true})

    if (!part) {
        throw new sequelize.ValidationError(`Part not found`)
    }

    const access = await Ticket.getTicketPerms(part.ticketId, userId)
    if (access.perm.partOrder.generalPart.editing != 1) {
        throw new sequelize.ValidationError(`Permission is denied`)
    }

    // Удаление всех статусов запчасти реализовано в ДБ 
    // через внешние ключи FK_partstatus_parts таблицы partstatus
    return GeneralPart.destroy({where: {id}}, {force: true})
});

// transaction functions
GeneralPart.transactionAddStatus = ((statusId, id, t) => {
    return GeneralPart.update({statusId}, {where:{id}, transaction:t});
});
GeneralPart.transactionFindOne = ((where, t) => {
    return GeneralPart.findOne({where, plain:true, transaction:t});
});
GeneralPart.transactionCreatePart = ((data, t) => {
    return GeneralPart.create(data, {transaction:t});
});

module.exports.GeneralPart = GeneralPart;
