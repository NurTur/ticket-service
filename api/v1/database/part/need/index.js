'use strict';

const cloner            = require(`cloner`);
const Sequelize         = require(`sequelize`);
const index             = require(`$home`);
const sequelize         = index.sequelize;
const Unit              = require(`$db_v1/part/unit`).Unit;
const Device            = require(`$db_v1/part/unit`).Device;
const User              = require(`$db_v1/user`).User;
const Ticket            = require(`$db_v1/ticket`).Ticket;
const TicketStatus      = require(`$db_v1/status`).Status;
const ticketTypeValues  = require(`$db_v1/type`).ticketTypeValues;
const ServiceType       = require(`$db_v1/serviceType`).ServiceType;
const InstPart          = require(`$db_v1/part/installed`).InstPart;
const Part              = require(`$db_v1/part/general`).GeneralPart;
const PartStatus        = require(`$db_v1/part/general`).Status;
const PartHistory       = require(`$db_v1/part/general/history`).History;
const Comment           = require(`$db_v1/comment`).Comment;
const StatusValues      = require(`$db_v1/status`).Status.Values;
const NeedPart          = sequelize.import(`part-need-definition`);
const Status            = sequelize.import(`part-status-definition`);
const NStatus           = sequelize.import(`part-status-definition`);
const NextStatus        = sequelize.import(`part-status-dependence-definition`);
const logger            = index.logger;

NeedPart.belongsTo(User, {foreignKey: `owner_id`});
NeedPart.belongsTo(Unit, {foreignKey: `unitid`});
NeedPart.belongsTo(Status, {as: `currentStatus`, foreignKey: `status`});
Status.belongsToMany(NStatus, {as: `next`, through: NextStatus, attributes: [], foreignKey: `current_status_id`});
NStatus.belongsToMany(Status, {as: `back`, through: NextStatus, attributes: [], foreignKey: `next_status_id`});
NeedPart.belongsTo(Ticket, {foreignKey: `orderid`});
NeedPart.hasOne(InstPart, {foreignKey: `need_part_id`});
NeedPart.hasOne(Part, {foreignKey: `need_part_id`});

NeedPart.Values = {
    request    : 0, // Запрос
    underway   : 1, // В работе
    available  : 2, // Доступно
    cancelled  : 3, // Отменено
    negotiation: 4, // Согласование стоимости
    shipped    : 5, // Отгружено
    unused     : 6  // Не использовано
};

const baseParams = {
    attributes: {
        exclude: [`owner_id`, `orderid`, `unitid`, `status`]
    },
    include: [
        {
            model: User,
            attributes: [`id`, `name`]
        },
        {
            model: Unit,
            attributes: [`id`, `name`],
            include: [
                {
                    model: Device,
                    attributes: [`id`, `name`],
                    as: `parent`
                }
            ]
        },
        {
            model: Status,
            as: `currentStatus`,
            include: [
                {
                    model: Status,
                    as: `next`,
                    through: {
                        attributes: []
                    }
                }
            ]
        }
    ]
};

const getParams = (async (userId, paramsFlag) => {
    const permParams = {
        attributes: [
            [Sequelize.fn(`IF`, Sequelize.literal(`\`ticket${sqzeModelSeparator}status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`instPart\`.\`id\` IS NOT NULL`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0
            ))), `perm${myObjSeparator}edit`]
        ],
        include: [
            {
                model: Ticket,
                attributes: [],
                include: [
                    {
                        model: TicketStatus,
                        attributes: []
                    }
                ]
            },
            {
                model: InstPart,
                attributes: []
            }
        ]
    };

    switch(paramsFlag) {
        case true: 
            const tmp = cloner.deep.copy(baseParams);
            tmp.attributes.include = [];
            permParams.attributes.forEach(item => {
                tmp.attributes.include.push(item)
            });
            permParams.include.forEach(item => {
                tmp.include.push(item)
            });
            return tmp;
            break;
        default: return permParams;
    };
});

NeedPart.getAll = (async (ticketId, userId) => {
    const params = userId
        ? await getParams(userId, true)
        : baseParams;
    const search = cloner.deep.merge({where: {ticketId}, order:[`id`]}, params);
    const parts  = await NeedPart.findAll(search);
    
    return index.rebuildMyArray(JSON.parse(JSON.stringify(parts)));
});

NeedPart.getToInstall = (ticketId => {
    return NeedPart.findAll({
        attributes: {
            exclude: [`owner_id`, `orderid`, `unitid`, `status`]
        },
        include: [
            {model: InstPart, attributes: []},
            {model: Part, attributes: [`substitution`]}
        ],
        where: sequelize.and(
            sequelize.where(sequelize.literal(`\`` + InstPart.name + `\`.\`id\``), null),
            {ticketId}, 
            {statusId: NeedPart.Values.available}
        )
    });
});

NeedPart.getById = (id, transaction = null) => {
    const params = {
        attributes: {
            exclude: [`unitid`]
        },
        include: [
            {model: Unit, attributes: [`id`, `noOrderFlag`]},
            {model: Part, attributes: [`substitution`]}
        ],
        transaction
    };

    return NeedPart.findById(id, params);
};

NeedPart.tryCreate = (async data => {
    const ticket = await Ticket.getTicketPerms(data.ticketId, data.userId);

    if (ticket.perm.partOrder.needPart.addition == 1) {
        return NeedPartRunLogic(`create`, data);
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

NeedPart.tryUpdate = (async data => {
    const id     = data.id;
    // const params = await getParams(data.userId, false);
    const params = await getParams(data.userId, true);
    const part   = await index.getPerms(id, params, NeedPart);

    index.rebuildMyObject(part);

    if (part.perm.edit == 1) {
        const statusId = data.statusId;
        let   next     = part.currentStatus.next;
        logger.debug(`next: `, next);

        if (next.length > 0) {
            next = next.map(item => {return item.id}); 
            if (next.indexOf(statusId) !== -1) {
                data.ticketId = part.ticketId;
                return NeedPartRunLogic(`update`, data);
            }
        }
        throw new sequelize.ValidationError(`StatusId:${statusId} not allowed`);
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

// transaction functions
NeedPart.transactionUpdateStatus = ((statusId, id, t) => {
    return NeedPart.update({statusId}, {where: {id}, transaction:t});
});
// подсчёт не установленных затребованных запасных частей
NeedPart.transactionNotInstalledCount = (async(ticketId, t) => {
    return NeedPart.count({
        include: {model: InstPart}, 
        where: sequelize.and(
            sequelize.where(sequelize.literal(`\`` + InstPart.name + `\`.\`id\``), null),
            {ticketId}, 
            {statusId:{$notIn:[
                NeedPart.Values.cancelled,
                NeedPart.Values.unused
            ]}}
        ),
        transaction:t
    });
});
const transactionCreateNeedPart = ((data, t) => {
    return NeedPart.create(data, {fields: [`ticketId`, `userId`, `name`, `number`, `quantity`, `unitId`], transaction:t});
});

const NeedPartRunLogic = (async (method, data) => {
    logger.info(`NeedPartRunLogic - `, method, data);

    const id       = data.id;
    const statusId = data.statusId;
    const ticketId = data.ticketId;
    const result   = {};

    await sequelize.transaction(async t => {
        switch(method) {
            case `create`:
                const ticket = await Ticket.transactionFindById(ticketId, null);
                logger.debug(`ticket: `, ticket);
                
                if (ticket == null) {
                    throw new sequelize.ValidationError(`Ticket not found`);
                };

                // добавление needPart
                const newNeedPart = await transactionCreateNeedPart(data, t);
                result.createNeedPart = newNeedPart;
                
                if (newNeedPart !== null) {
                    // добавление Q заявки
                    const ticketQ = await Ticket.transactionCreateTicket({
                        typeId          : ticketTypeValues.Q,
                        serviceTypeId   : ServiceType.Values.supply,
                        statusId        : TicketStatus.Values.registered,
                        customerId      : ticket.get(`customerId`),
                        parentId        : ticketId,
                        ownerId         : data.userId,
                        date            : new Date(),
                        vendorId        : ticket.get(`vendorId`),
                        cityId          : ticket.get(`cityId`)
                    }, t);

                    result.createTicketQ = ticketQ;

                    if (ticketQ !== null) {
                        // добавление part для Q заявки
                        result.createPart = await Part.transactionCreatePart({
                            ticketId  : ticketQ.get(`id`),
                            needPartId: newNeedPart.get(`id`),
                            vendorId  : ticket.get(`vendorId`),
                            name      : data.name,
                            number    : data.number,
                            quantity  : data.quantity
                        }, t);

                        // Если тип заявки: "Заявки по договорам" или "Заявки по разовым заказам"
                        // устанавливаем вид работы в "Ремонт"
                        if ([ticketTypeValues.M, ticketTypeValues.S].includes(ticket.get(`typeId`)) && ticket.serviceTypeId != ServiceType.Values.repair) {
                            const params = {
                                ticketId,
                                statusId: StatusValues.partWaiting, // Изменил значение ticket.get(`statusId`) на StatusValues.partWaiting.
                                                                    // Получается так, что статус заявки изменяется в триггере после добавления 
                                                                    // затребованной запчасти на "Ожидание запчасти", а в историю добавляется запись 
                                                                    // со статусом заявки из ticket.get(`statusId`).
                                                                    // Вернуть предыдущий вариант после отказа от триггеров.
                                userId: data.userId,
                                performerId: ticket.get(`performerId`),
                                serviceTypeId: ServiceType.Values.repair
                            }

                            result.changeServiceType = await Ticket.updateServiceType(params, t)
                        };

                        result.addComment = await Comment.transactionAddComment({
                            ticketId,
                            deviceId: data.comment.deviceId,
                            ownerId: data.userId,
                            text: data.comment.text
                        }, t);
                    } else {
                        throw new Error(`Error creating TicketQ`);
                    };
                } else {
                    throw new Error(`Error creating NeedPart`);
                }
                break;
            case `update`:
                // обновление статуса needPart
                result.needPartStatusUpdate = await NeedPart.transactionUpdateStatus(statusId, id, t);
                
                if ([NeedPart.Values.available, NeedPart.Values.cancelled].indexOf(statusId) !== -1) {
                    // получение связанной с Q заявкой запчасти
                    const part = await Part.transactionFindOne({needPartId:id}, null);
                    logger.trace(`Part: `, part.get({plain:true}));
                    if (part !== null) {
                        // получение Q заявки
                        const qTicket = await Ticket.transactionFindById(part.get(`ticketId`), null);
                        logger.trace(`qTicket`, qTicket.get({plain:true}));
                        
                        if (qTicket == null) {
                            throw new sequelize.ValidationError(`QTicket not found`);
                        };

                        // подготовка нового статуса Q заявки
                        let ticketStatus;
                        switch(statusId) {
                            // доступно
                            case NeedPart.Values.available:
                                ticketStatus = TicketStatus.Values.available;
                                break;
                            // отменено
                            case NeedPart.Values.cancelled:
                                ticketStatus = TicketStatus.Values.cancelled;

                                // добавление статуса в историю для part
                                result.partHistory = await PartHistory.transactionAddHistory({
                                    partId  : part.get(`id`),
                                    statusId: PartStatus.Values.cancelled,
                                    date    : new Date(),
                                    quantity: part.get(`quantity`),
                                    comment : index.config.partCancellationComment
                                }, t);

                                break;
                        };
                        
                        // обновление статуса Q заявки и добавление статуса Q заявки в историю
                        result.QTicketStatusResult = await Ticket.transactionUpdateTicketStatus({
                            statusId     : ticketStatus,
                            ticketId     : qTicket.get(`id`),
                            serviceTypeId: qTicket.get(`serviceTypeId`),
                            performerId  : qTicket.get(`performerId`),
                            userId       : data.userId
                        }, t);
                    };
                }
                break;
        }
    });

    return result;
});

module.exports.NeedPart = NeedPart
module.exports.Status = Status
module.exports.NextStatus = NextStatus