`use strict`;

const cloner       = require(`cloner`);
const Sequelize    = require(`sequelize`);
const index        = require(`$home`);
const sequelize    = index.sequelize;
const Unit         = require(`$db_v1/part/unit`).Unit;
const Device       = require(`$db_v1/part/unit`).Device;
const User         = require(`$db_v1/user`).User;
const Ticket       = require(`$db_v1/ticket`).Ticket;
const TicketStatus = require(`$db_v1/status`).Status;
const Part         = require(`$db_v1/part/general`).GeneralPart;
const InstPart     = sequelize.import(`part-installed-definition`);
const PartRelation = sequelize.import(`part-ticket-relation-definition`);
const logger       = index.logger;

InstPart.belongsTo(User, {foreignKey: `userid`});
InstPart.belongsTo(Unit, {foreignKey: `unitid`});
InstPart.belongsTo(Ticket, {foreignKey: `orderid`});
InstPart.belongsToMany(Ticket, {as: `tickets`, through: PartRelation, attributes: [], foreignKey: `instPartId`, otherKey: 'ticketId'});

const baseParams = {
    attributes: {
        exclude: [`userid`, `orderid`, `unitid`, `need_part_id`],
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
            model: Ticket,
            as: `tickets`,
            attributes: [`number`],
            through: {
                attributes: []
            }
        },
    ]
};

const getParams = (async (userId, paramsFlag) => {
    logger.info(`InstPart.getParams`);
    const role = await User.getUserRole(userId);

    const permParams = {
        attributes: [
            [Sequelize.fn(`IF`, Sequelize.literal(`\`ticket${sqzeModelSeparator}status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`instPart\`.\`need_part_id\` IS NOT NULL AND \`instPart\`.\`need_part_id\` != 0`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`),
                        Sequelize.fn(`IF`, Sequelize.literal(`${role} IN(${User.RoleValues.coordinator}, ${User.RoleValues.seniorCoordinator})`), 0, 1),
                        Sequelize.fn(`IF`, Sequelize.literal(`\`instPart\`.\`userid\` = ${userId}`), 1, 0)
            ))), `perm.edit`],
            [Sequelize.fn(`IF`, Sequelize.literal(`\`ticket${sqzeModelSeparator}status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`),
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} IN(${User.RoleValues.coordinator}, ${User.RoleValues.seniorCoordinator})`), 0, 1),
                    Sequelize.fn(`IF`, Sequelize.literal(`\`instPart\`.\`userid\` = ${userId}`), 1, 0)
            )), `perm.delete`]
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
            }
        ]
    };

    switch(paramsFlag) {
        case true:
            const tmp = cloner.deep.copy(baseParams);
            tmp.attributes.include = permParams.attributes
            tmp.include.splice(2, 1, ...permParams.include)
            return tmp;
            break;
        default: return permParams;
    };
});

// получение связанных с установленными запчастями заявок
const getTTickets = where => {
    logger.info(`getTTickets - `);
    return InstPart.findAll({
        attributes:[`id`],
        include: [
            {
                model: Ticket,
                as: `tickets`,
                attributes: [`number`],
                through: {
                    attributes: []
                },
                required: false,
                where: {
                    statusId: {
                        $notIn: [TicketStatus.Values.annuled, TicketStatus.Values.cancelled]
                    }
                }
            }
        ],
        where
    });
};

// добавление объекта tickets в каждый элемент part
const addTicketNumbers = (arr, arr2) => {
    logger.info(`addTicketNumbers - `)

    if (arr) {
        if (Array.isArray(arr)) {
            for (let i = 0; i < arr.length; i++) {
                const numbers = arr2.find(item => {
                    return item.id == arr[i].id;
                });

                arr[i].tickets = (numbers) ? numbers.tickets : null;
            }
        }
    }

    return arr;
};

InstPart.getAll = (async (ticketId, userId) => {
    const params = userId
        ? await getParams(userId, true)
        : baseParams;
    const role = userId && await User.getUserRole(userId);
    const where  = !userId || role > User.RoleValues.headOfDepartment
        ? {ticketId}
        : {ticketId, userId};
    const search = cloner.deep.merge({where, order: [`name`, `id`]}, params)

    if (userId) {
	    // добавляю вручную номера T заявок
	    const _parts = await InstPart.findAll(search)
	    const parts1 = JSON.parse(JSON.stringify(_parts))
	    const __parts = await getTTickets(where)
	    const parts2 = JSON.parse(JSON.stringify(__parts))

	    return addTicketNumbers(parts1, parts2)
	}

	return InstPart.findAll(search)

});

InstPart.getById = id => {
    const params = cloner.deep.copy(baseParams);
    const search = cloner.deep.merge({where: {id}}, params);

    return InstPart.findOne(search);
}

// проверка на наличие созданных T заявок у запчасти
const checkPartDependence = async id => {
    logger.info(`checkPartDependence - `);
    const part = await getTTickets({id});
    logger.trace(`part - `, part);
    if (part.length > 0) {
        if (part[0].tickets && part[0].tickets.length > 0) {
            throw new sequelize.ValidationError(index.config.MESSAGES.instPart.action.ticketsExists);
            return false;
        } else {
            return true;
        }
    } else {
        throw new sequelize.ValidationError(`InstPart not found`);
    }
}

InstPart.tryCreate = async data => {
	const TT = require(`$db_v1/type`).ticketTypeValues;
	const ST = require(`$db_v1/serviceType`).ServiceType.Values;
	const ticketId = data.ticketId
	const result = {}

  logger.info(`InstPart.tryCreate`);
  const access = await Ticket.getTicketPerms(ticketId, data.userId);
	if (access.perm.instPart.addition != 1) {
		throw new sequelize.ValidationError(`Permission is denied`);
	}
	await sequelize.transaction(async t => {
		const fromNeed = data.needPartId && data.needPartId > 0
		result.createPart = fromNeed ? await createPartFromNeed(data, t) : await InstPart.create(data, {transaction: t})
		if (!result.createPart) {
			const msg = `Could not create installed part`
			throw new sequelize.ValidationError(msg)
		}
		const ticket = await Ticket.transactionFindById(ticketId, t)
		if ([TT.M, TT.S].includes(ticket.get(`typeId`)) && ticket.get(`serviceTypeId`) != ST.repair) {
			const params = {
				ticketId,
				statusId: ticket.get(`statusId`),
				userId: ticket.get(`ownerId`),
				performerId: data.userId,
				serviceTypeId: ST.repair
			}
			result.changeServiceType = await Ticket.updateServiceType(params, t)
		}
	})
	return result
}

// добавление затребованной запчасти в установленные
async function createPartFromNeed(data, t) {
	logger.info(`InstPart.createPartFromNeed`);
	logger.debug(`data: `, data);

	const {ticketId, userId, needPartId} = data
	const existingPart = await InstPart.findOne({where: {ticketId, needPartId}, transaction: t});
	logger.trace(`existingPart: `, existingPart);

	// проверка на уже созданную запчасть из затребованной
	if (existingPart) {
		const msg = `InstPart with needPartId:${needPartId} allready exists`
		throw new sequelize.ValidationError(msg);
	};

	const {NeedPart} = require(`$db_v1/part/need`);
	const part = await NeedPart.getById(data.needPartId, t);

	if (part == null) {
		const msg = `No need parts found`
		throw new sequelize.ValidationError(msg)
	};
	logger.trace(`needPart: `, part.get({plain:true}));

	// проверка на соответствие запчастей одной заявке
	if (part.get(`ticketId`) !== ticketId) {
		const msg = `Incorrect needPartId or ticketId`
		throw new sequelize.ValidationError(msg);
	};

	const type = part.get(`unit`) ? part.get(`unit`).get(`noOrderFlag`) : null;
	logger.debug(`type: `, type);

	const substitution = part.get(Part.name).get(`substitution`);
	const obj = {
	    ticketId,
        needPartId,
        userId,
		// type: type || 0,
        name: part.get(`name`),
        number: substitution ? substitution : part.get(`number`),
        quantity: part.get(`quantity`),
        unitId: part.get(`unitId`)
	}

    if (type) {
        obj.type = type;
    }

	return InstPart.create(obj, {transaction: t});
}

InstPart.tryUpdate = (async data => {
    logger.info(`tryUpdate - `);
    const id      = data.id;
    const params  = await getParams(data.userId, false);
    const part    = await index.getPerms(id, params, InstPart);

    if (part.perm.edit == 1) {
        if (await checkPartDependence(id)) {
            return InstPart.update(data, {where : {id}, fields: [`userId`, `type`, `name`, `number`, `quantity`, `unitId`, `comment`]});
        };
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

InstPart.tryDelete = (async data => {
    logger.info(`tryDelete - `);
    const id      = data.id;
    const params  = await getParams(data.userId, false);
    const part    = await index.getPerms(id, params, InstPart);

    if (part.perm.delete == 1) {
        if (await checkPartDependence(id)) {
            return InstPart.destroy({where: {id}}, {force: true})
        };
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

module.exports.InstPart = InstPart
module.exports.PartRelation = PartRelation
