'use strict'

const u = require(`nodejs-utils`)
const fs = require(`fs`)
const cloner = require(`cloner`)
const Sequelize = require(`sequelize`)
const index = require(`$home`)
const sequelize = index.sequelize
const logger = index.logger
const Ticket = sequelize.import(`ticket-definition`)
const User = require(`$db_v1/user`).User
const Status = require(`$db_v1/status`).Status
const ticketTypeValues = require(`$db_v1/type`).ticketTypeValues
const City = require(`$db_v1/city`).City
const Equipment = require(`$db_v1/equipment`).Equipment
const EquipmentType = require(`$db_v1/equipment`).EquipmentType
const Customer = require(`$db_v1/customer`).Customer
const ServiceType = require(`$db_v1/serviceType`).ServiceType
const History = require(`$db_v1/ticketHistory`).History
const Contract = require(`$db_v1/contract`).Contract
const Contact = require(`$db_v1/contact`).Contact
const Vendor = require(`$db_v1/vendor`).Vendor
const Supplier = require(`$db_v1/supplier`).Supplier
const Reason = require(`$db_v1/reason`).Reason

module.exports.Ticket = Ticket

const {Unit, Device: UnitDevice} = require(`$db_v1/part/unit`)
const {Comment, Device} = require(`$db_v1/comment`)
const {Timeout} = require(`$db_v1/ticketTimeout`)
const TimeoutReason = require(`$db_v1/ticketTimeout`).Reason
const Part = require(`$db_v1/part/general`).GeneralPart
const {InstPart} = require(`$db_v1/part/installed`)
const {NeedPart, Status: NeedPartStatus, NextStatus} = require(`$db_v1/part/need`)

const query = {
    getTopTicketId: fs.readFileSync(db_v1 + `ticket/query/getTopTicketId.sql`).toString()
}

Ticket.belongsTo(Status, {foreignKey: `statusId`})
Ticket.belongsTo(User, {as: `performer`, foreignKey: `performerId`})
Ticket.belongsTo(City, {foreignKey: `cityId`})
Ticket.belongsTo(Equipment, {foreignKey: `equipmentId`})
Ticket.belongsTo(Customer, {foreignKey: `customerId`})
Ticket.belongsTo(Contact, {as: `customerPerson`, foreignKey: `customerPersonId`})
Ticket.belongsTo(ServiceType, {foreignKey: `serviceTypeId`})
Ticket.belongsTo(Vendor, {foreignKey: `vendorId`})
Ticket.belongsTo(Customer, {as: `seller`, foreignKey: `sellerId`})
Ticket.belongsTo(Contact, {as: `sellerPerson`, foreignKey: `sellerPersonId`})
Ticket.belongsTo(Contract, {foreignKey: `contractId`})
Ticket.belongsTo(Supplier, {foreignKey: `equipSupplierId`})
Ticket.belongsTo(Reason, {foreignKey: `reasonId`})
Ticket.belongsTo(Timeout, {foreignKey: `id`, targetKey: `ticketId`})

Ticket.hasMany(Part, {foreignKey: `ticketId`, sourceKey: `id`})
Ticket.hasMany(NeedPart, {foreignKey: `ticketId`, sourceKey: `id`})
Ticket.hasMany(InstPart, {foreignKey: `ticketId`, sourceKey: `id`})
Ticket.hasMany(Comment, {foreignKey: `ticketId`, sourceKey: `id`})
Ticket.hasMany(History, {as: `history`, foreignKey: `ticketId`, sourceKey: `id`})

// will get the last one contact
// Ticket.belongsTo(Contact, {as: `customerContact`, targetKey: `customerId`, foreignKey: `customerId`})
// will get all contacts
// Ticket.hasMany(Contact, {as: `customerContact`, foreignKey: `customerId`, sourceKey: `customerId`});

History.belongsTo(Status, {as: `historyStatus`, foreignKey: `statusId`});
History.belongsTo(User, {as: `historyPerformer`, foreignKey: `performerid`});
History.belongsTo(User, {as: `historyOwner`, foreignKey: `ownerid`});
History.belongsTo(ServiceType, {as: `historyServiceType`, foreignKey: `servicetypeid`});

Comment.belongsTo(User, {as: `commentUser`, foreignKey: `ownerid`});
Device.belongsTo(Device, {as: `parentDevice`, foreignKey: `parent_id`});

InstPart.belongsTo(User, {as: `instPartUser`, foreignKey: `userid`});
InstPart.belongsTo(Unit, {as: `instPartUnit`, foreignKey: `unitid`});
Unit.belongsTo(UnitDevice, {as:`instPartParentUnit`, foreignKey: `deviceid`});

NeedPart.belongsTo(User, {as: `needPartUser`, foreignKey: `owner_id`});
NeedPart.belongsTo(Unit, {as: `needPartUnit`, foreignKey: `unitid`});
NeedPartStatus.belongsToMany(NeedPartStatus, {as: `nextStatus`, through: NextStatus, attributes: [], foreignKey: `current_status_id`});
Unit.belongsTo(UnitDevice, {as:`needPartParentUnit`, foreignKey: `deviceid`});

const baseParams = {
	attributes: [],
	include: [
        {model: Status},
        {model: User, as: `performer`},
        {model: City},
        {model: Equipment, include: {model: EquipmentType, attributes: []}},
        {model: Customer},
        // {model: Contact, as: `customerContact`, separate: true, limit: 1},
        {model: Contact, as: `customerPerson`},
        {model: ServiceType},
        {model: Vendor},
        {model: Customer, as: `seller`},
        {model: Contact, as: `sellerPerson`},
        {model: Contract},
        {model: Supplier},
        {model: Reason},
        {model: Part, attributes:[]},
        {model: Timeout, 
            required: false, where: {activeFlag: index.config.tinyIntValues[1]},
            include: {model: TimeoutReason}
        },
        {model: NeedPart, separate: true,
            include: [
                {model: User, as: `needPartUser`},
                {model: Unit, as: `needPartUnit`,
                    include: [{model: Device, as: `needPartParentUnit`}]
                },
                {model: NeedPartStatus, as: `currentStatus`,
                    include: [
                        {model: NeedPartStatus, as: `nextStatus`, through: {attributes: []}}
                    ]
                }
            ]
        },
        {model: InstPart, separate: true,
            include: [
                {model: User, as: `instPartUser`},
                {model: Unit, as: `instPartUnit`,
                    include: [{model: UnitDevice, as: `instPartParentUnit`}]
                },
                {model: Ticket, as: `tickets`,through: {attributes: []}}
            ]
        },
        {model: History, separate: true,
            as: `history`,
            include: [
                {model: Status, as: `historyStatus`},
                {model: User, as: `historyPerformer`},
                {model: User, as: `historyOwner`},
                {model: ServiceType, as: `historyServiceType`}
            ]
        },
        {model: Comment, separate: true,
            include: [
                {model: User, as: `commentUser`},
                {model: Device,
                    include: [{model: Device, as: `parentDevice`}]
                }
            ]
        }
	],
	model: Ticket,
    raw: true
}

// построение объекта доступных моделей
// для использования при формировании условий поиска заявок
const availableModels = buildAvailableModels(baseParams).reduce((result, item) => {
    return Object.assign(result,item)
}, {})

logger.debug(`availableModels: `, availableModels)

function buildAvailableModels(tree, model = null) {
    const modelName = getModelName(tree)
    const result = {[modelName]: tree.model}

    if (model) {
        if (model.myAssociations) {
            model.myAssociations.push(modelName)
        } else {
            model.myAssociations = [modelName];
        }
    }

    if (!tree.include) return [result]

    const include = Array.isArray(tree.include) ? tree.include : [tree.include]
    const childs = []
    include.forEach(child => childs.push(...buildAvailableModels(child, tree.model)))
    return [result, ...childs]
}

// получение объекта параметров модели заявок
Ticket.getParams = async (userId, paramsFlag) => {
	logger.info(`Ticket.getParams`)
	const role = await User.getUserRole(userId)

	const permParams = {
		attributes: [
			[Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`${role} < ${User.RoleValues.seniorEngineer}`),
                    Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` != ${userId}`), 0,
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`statusid\` = ${Status.Values.underway}`), 1, 0)),
                    Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`statusid\` IN(${Status.Values.registered}, ${Status.Values.appointed}, ${Status.Values.handled}, ${Status.Values.underway})`), 1, 0)
            )), `perm${myObjSeparator}serviceType`],

            [Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`${role} < ${User.RoleValues.seniorEngineer}`), 0, 
                    Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`statusid\` IN(${Status.Values.registered}, ${Status.Values.appointed}, ${Status.Values.partWaiting}, ${Status.Values.handled}, ${Status.Values.customerWaiting}, ${Status.Values.underway})`), 1, 0)
            )), `perm${myObjSeparator}setPerformer`],

			[Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`${role} = ${User.RoleValues.noUser}`), 1,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`), 1,
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            ))), `perm${myObjSeparator}comment`],

			[Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`), 1,
                    Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            )), `perm${myObjSeparator}status`],

            [Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`ordertypeid\` NOT IN(${ticketTypeValues.M}, ${ticketTypeValues.S}, ${ticketTypeValues.R})`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`), 1,
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            ))), `perm${myObjSeparator}partOrder${myObjSeparator}needPart${myObjSeparator}addition`],
			
            [Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`ordertypeid\` NOT IN(${ticketTypeValues.P}, ${ticketTypeValues.L})`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} < ${User.RoleValues.coordinator}`), 0,
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            ))), `perm${myObjSeparator}partOrder${myObjSeparator}generalPart${myObjSeparator}addition`],
            [Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`ordertypeid\` NOT IN(${ticketTypeValues.P}, ${ticketTypeValues.Q}, ${ticketTypeValues.L})`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} < ${User.RoleValues.coordinator}`), 0,
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            ))), `perm${myObjSeparator}partOrder${myObjSeparator}generalPart${myObjSeparator}editing`],

			[Sequelize.fn(`IF`, Sequelize.literal(`\`status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`ordertypeid\` NOT IN(${ticketTypeValues.M}, ${ticketTypeValues.S}, ${ticketTypeValues.R})`), 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`${role} > ${User.RoleValues.headOfDepartment}`),
                        Sequelize.fn(`IF`, Sequelize.literal(`${role} IN(${User.RoleValues.coordinator}, ${User.RoleValues.seniorCoordinator})`), 0, 1),
                        Sequelize.fn(`IF`, Sequelize.literal(`\`ticket\`.\`performerid\` = ${userId}`), 1, 0)
            ))), `perm${myObjSeparator}instPart${myObjSeparator}addition`]
		],
		include: [
			{
				model: Status,
                required: true,
				attributes: []
			}
		]
	}

	switch (paramsFlag) {
	case true:
		const tmp = cloner.deep.copy(baseParams)
		permParams.attributes.forEach(param => {
			tmp.attributes.push(param)
		})

        for (let i = 0; i <= tmp.include.length; i++) {
            if (tmp.include[i].model == Status) {
                tmp.include[i].required = true
                break
            }
        }

		return tmp
		break
	default: return permParams
	}
}

// получение объекта разрешений для заявки
Ticket.getTicketPerms = async (id, userId) => {
	logger.info(`Ticket.getTicketPerms`)
	logger.debug(id, userId)

	const params = await Ticket.getParams(userId, false)

	const ticket = await index.getPerms(id, params, Ticket)

	index.rebuildMyObject(ticket)
	logger.debug(JSON.stringify(ticket))

	return ticket
}

// не работает из-за некорректного построения запроса в sequelize, для того чтоб заработало
// приходится запрашивать все аттрибуты модели tickets, на основании которых происходит JOIN других таблиц
// получение raw заявок на экспорт
Ticket.getAll_SimpleSearch = async data => {
    let params = cloner.deep.copy(baseParams)
    params.raw = `raw` in data

    logger.info(`getAll_SimpleSearch`)
    logger.debug(`params`, params)

    const mainSearch = getSearch(data)
    prepareSearch(params, mainSearch, true)
    
    return data.count
        ? Ticket.findAndCount(params)
        : Ticket.findAll(params)
}

// получение заявок
Ticket.getAll_DualSearch = async (data, userId) => {
	let params = userId ? await Ticket.getParams(userId, true) : cloner.deep.copy(baseParams)
    logger.info(`getAll_DualSearch`)
    logger.debug(`params`, params)

    // разделил получение заявок на 2 этапа из-за задержек при постраничном отображении
    // подробнее в статье https://habrahabr.ru/post/217521/
    // 1 - получение идентификаторов заявок
    const mainSearch = getSearch(data)
    const fastSearch = cloner.deep.copy(mainSearch);

    logger.debug(`fastSearch: `, fastSearch);

    fastSearch.fields = {models: [`ticket`], ticket: [`id`]}
    const _params = cloner.deep.copy(baseParams)

    let search = prepareSearch(_params, fastSearch, true)
    let count = 0
    let _tickets = null
    if (data.count) {
        const found = await Ticket.findAndCount(_params)
        count = found.count
        _tickets = found.rows
    }
    else {
        _tickets = await Ticket.findAll(_params)
    }

	if (_tickets == null || _tickets.length == 0) {
		logger.trace(`Nothing found...`)
		if (data.count) {
            return {count, rows: []}
        }
        else {
            return []
        }
	}

    // 2 - получение заявок
    logger.debug(`_tickets:`, _tickets)
    const ids = _tickets.reduce((arr, ticket) => {
        arr.push(ticket.id)
        return arr
    }, []);
    delete mainSearch.limit
    mainSearch.filters = {models: [`ticket`], ticket: {id: {$in: ids}}}
    search = prepareSearch(params, mainSearch)

    // отмена raw формата, чтоб вернулся instance
    // если использовать raw, то вложенные модели придут как 'nestedModel.key': value
    params.raw = false
    _tickets = await Ticket.findAll(params)
    
    if (_tickets == null) {
        throw new Error(`Tickets lost...`);
    }

    const tickets = index.getPlainData(_tickets)

    // из-за проблем с вложенностью в sequelize приходится вручную запрашивать следующие статусы
    // из базы и добавлять в tickets
    // убрать при исправлении бага в sequelize
	const __tickets = `next` in search.fields && Status.name in search.fields && userId ? await getNextStatus(tickets, userId) : tickets
    // добавление одного первого контакта
	const ___tickets = `customerContact` in search.fields ? await getCustomerContact(__tickets) : __tickets

    if (data.count) {
	   return userId ? {count, rows: index.rebuildMyArray(__tickets)} : {count, rows: __tickets}
    }
    else {
        return userId ? index.rebuildMyArray(__tickets) : __tickets
    }
}

// получение одной заявки по id
Ticket.getById = async (id, userId) => {
	logger.debug(`Ticket.getById - `, id, `, `, userId)

	if (userId) {
		const params = await Ticket.getParams(userId, false)
		const _ticket = await Ticket.findById(id, {attributes: {include: params.attributes}, include: params.include})
		const ticket = index.getPlainData(_ticket)
		index.rebuildMyObject(ticket)
		return ticket
	}

	return Ticket.findById(id)
}

// преобразование объекта поиска
// вложенные элементы "fields" выносятся в одномерный массив
const getSearch = data => {
	const search = {}
	const searchParams = [`fields`, `filters`, `sort`, `limit`]

	logger.info(`getSearch...`)
    logger.debug(data)
    // подготовка данных поиска
	searchParams.forEach(param => {
		if (param in data) {
			const paramObj = index.validateJSON(data[param])

            // проверка paramObj на valid JSON object
			if (paramObj) {
                // проверка необходимого типа для параметров
				if (param == `limit`) {
					if (!Array.isArray(paramObj)) {
						throw new sequelize.ValidationError(`Query '${param}' have to be an array`)
					}
				}
				else {
					if (!(typeof paramObj === `object`)) {
						throw new sequelize.ValidationError(`Query '${param}' have to be an object`)
					}
				}

				if (param == `fields`) {
					search[param] = {}
					stepOne(paramObj, search.fields)
				}
				else {
					search[param] = paramObj
				}
				if (param !== `limit`) {
					search[param].models = Object.keys(search[param])
				}
			}
			else {
				throw new sequelize.ValidationError(`Query '${param}' is not a valid JSON object`)
			}
		}
	})

	return search
}

const prepareSearch = (params, search, limits = false) => {
    logger.info(`Ticket.prepareSearch`)
    search.checkedModels = []
    search.order = []

    logger.debug(`searchObj: `, search)

    // добавление параметров fields & where
    // подготовка параметров sort
    stepThree(params, search, [], true)

    logger.debug(`search.order: `, search.order)

    // добавление массива сортировки
    if (search.order.length > 0) {
        params.order = search.order.reduce((result, newValue) => {
            newValue.forEach(value => {
                result.push(value)
            })
            return result
        }, [])
    }

    if (limits) {
        // добавление параметров limit & offset
        addLimits(`limit` in search ? search.limit : [], params)
    }

    // удаление пустых аттрибутов у родительской модели,
    // если у дочерней модели будет выводиться хотя бы одно поле
    deleteAttributes(params)

    logger.debug(`checkedModels: `, search.checkedModels)

    // удаление ненужных моделей в include
    deleteUnnecessaryIncludes(search, params)

    logger.debug(`params: `, params)

    return search
}

const stepOne = (obj, result) => {
	for (let key in obj) {
		if (Array.isArray(obj[key])) {
			stepTwo(key, obj[key], result)
		}
	}
}

// Эта функция при запросе fields={"ticket":[{"status":[]}]} - не вернёт ни одного поля ticket, только status
// аналогично запросу fields={"status":[]}
// const stepTwo = ((key, arrVal, result) => {
//     const tmp = [];
//     if (arrVal.length > 0) {
//         arrVal.forEach(item => {
//             if (typeof item === `object` && Array.isArray(item) == false) {
//                 stepOne(item, result);
//             };
//             if (typeof item === `string`) {
//                 tmp.push(item);
//             }
//         })

//         if (tmp.length > 0) {
//             result[key] = tmp;
//         }
//     } else {
//         result[key] = tmp;
//     }
// });

// Эта функция при запросе fields={"ticket":[{"status":[]}]} - вернёт все поля ticket и status
// аналогично запросу fields={"ticket":[],status":[]}
const stepTwo = (key, arrVal, result) => {
	const tmp = []
	if (arrVal.length > 0) {
		arrVal.forEach(item => {
			if (typeof item === `object` && Array.isArray(item) == false) {
				stepOne(item, result)
			}
			if (typeof item === `string`) {
				tmp.push(item)
			}
		})
	}

	result[key] = tmp
}

// Функция использует deepMode, т.е. если в модели присутствует include другой модели,
// то функция вызовет сама себя с новыми параметрами для вложенной модели
const stepThree = (obj, data, sortParentArray, main) => {
	if (`model` in obj) {
		const model = obj.model

        // подготовка массива родительских моделей для сортировки
        // не требуется для root модели
		if (!main) {
			sortParentArray.push(`as` in obj ? {model: obj.model, as: obj.as} : {model: obj.model})
		}

		addModelAttribute(data, model, obj)
		addModelWhereClause(data, model, obj)
		addModelSortClause(data, sortParentArray, obj)

		if (`include` in obj) {
			const subitem = obj.include
            // если модель включает несколько моделей, то include объявляется как массив
            // и надо обработать каждый его элемент
			if (Array.isArray(subitem)) {
				subitem.forEach(includeItem => {
					stepThree(includeItem, data, cloner.deep.copy(sortParentArray))
				})
			}
            // если модель включает только одну модель, то include объявляется как объект
            // и можно сразу его обработать
			else {
				stepThree(subitem, data, cloner.deep.copy(sortParentArray))
			}
		}
	}
}

// получение имени модели, учитывая параметр "as"
function getModelName(item) {
    return item.as ? item.as : item.model.name
}

// Функция проверяет на существование аттрибута из search.fields.[modelName] в аттрибутах указанной model
// и добавляет его в указанный result.attributes в положительном случае
// Если search.fields.[modelName] является пустым массивом, то параметр attributes удаляется из model
const addModelAttribute = (search, model, result) => {
	const modelName = getModelName(result)

    // не отображать поля модели
    // result.attributes = [];
	if (!(`attributes` in result)) {
		result.attributes = []
	}

	if (`fields` in search) {
		if (search.fields.models.indexOf(modelName) !== -1) {
			const searchAttributes = search.fields[modelName]
			if (searchAttributes.length > 0) {
				const resultArr = getAttributesLink(result)
                // добавление запрошенных полей в аттрибуты модели
				searchAttributes.forEach(attr => {
					if (attr in model.attributes) {
						resultArr.push(attr)
					}
				})
			}
			else {
                // отображение всех полей модели
				if (`attributes` in result) {
					if (Array.isArray(result.attributes)) {
						if (result.attributes.length !== 0) {
							const tmp = cloner.deep.copy(result.attributes)
							result.attributes = {include: tmp}
						}
						else {
							delete result.attributes
						}
					}
				}
			}
		}
	}
}

// Функция возвращает ссылку на аттрибуты модели
// Если параметра attributes нет в модели, то
// obj.attributes приравнивается к [] и возвращается ссылка на него
const getAttributesLink = (obj, defaultValue) => {
	if (Array.isArray(obj.attributes)) {
		return obj.attributes
	}

	if (typeof obj.attributes === `object`) {
		if (`include` in obj.attributes) {
			if (!Array.isArray(obj.attributes.include)) {
				obj.attributes.include = []
			}
		}
		else {
			obj.attributes.include = []
		}
		return obj.attributes.include
	}

	obj.attributes = []
	return obj.attributes
}

// Функция проверяет на существование аттрибута из fields в указанной model
// и добавляет его в указанный result в положительном случае
const addModelWhereClause = (search, model, result) => {
	const modelName = getModelName(result)
	const tmp = {}

	if (`filters` in search) {
		if (search.filters.models.indexOf(modelName) !== -1) {
			const fields = search.filters[modelName]
			for (let key in fields) {

                logger.debug(`search.filters`, search.filters);

                const models = checkKey(key, fields[key], model)
                if (models) {
                    tmp[key] = fields[key]
                    search.checkedModels.push(...models)
                }
			}
		}
	}

	if (Object.keys(tmp).length > 0) {
        // очистка имеющегося условия activeFlag = 1 в моделе Timeout
        // при этом будет происходить поиск по неактивным значениям тоже
        if (result.model == Timeout &&
            JSON.stringify(result.where) == JSON.stringify({activeFlag: index.config.tinyIntValues[1]})
        ) {
            result.where = tmp
            result.required = true
        } 
        else if (`where` in result) {
			cloner.deep.merge(result.where, tmp)
		}
		else {
			result.where = tmp
		}
	}
}

// Функция проверяет существует ли key в model
const checkKey = (key, data, model) => {
    logger.info(`checkKey: `, key, model.name)
    const reDifModel = /^\$(\w+\..+)\$$/
    const models = [model.name]

    if (key.match(reDifModel)) { // key соответствует вложенной моделе ($status.final$ и т.д.)
        const [modelName, ..._key] = reDifModel.exec(key)[1].split(`.`)

        if (!(modelName in availableModels)) {
            logger.debug(`Model ${modelName} undefined`)
            return false
        }

        if (model.myAssociations.includes(modelName)) {
            const _model = availableModels[modelName]
            models.push(modelName)
            if (_key.length > 1) {
                const result = checkKey(`$${_key.join(`.`)}$`, data, _model)
                return (result) ? [...models, ...result] : false
            } else {
                if (checkModelRawAttribute(_key, _model)) {
                    // logger.debug(`_model.attributes:`, _model.rawAttributes, _model.attributes)
                    return models
                } else {
                    logger.debug(`${_key} not in ${_model.name}.attributes`)
                    return false
                }
            }
        } else {
            logger.debug(`Model ${model.name} have no associations with model ${modelName}`)
            return false
        }
    } else if (key == `$or` || key == `$and`) { // key соответствует условию $or или $and
        let result = false
        const runCheck = data => {
            for (let key in data) {
                result = checkKey(key, data[key], model)
                if (result) {
                    models.push(...result)
                } else {
                    break
                }
            }
        }

        switch (key) {
        case `$or`: // data type of []
            data.forEach(dataElement => runCheck(dataElement))
            break
        case `$and`: // data type of {}
            runCheck(data)
            break 
        }
        
        return (models.length > 1) ? models : false
    } else if ([`$eq`, `$ne`, `$gte`, `$gt`, `$lte`, `$lt`, `$not`, `$in`, `$notIn`, 
        `$is`, `$like`, `$notLike`, `$between`, `$notBetween`].includes(key)) {
        return models
    } else if (key in model.attributes) { // key соответствует аттрибуту модели
        return models
    } else {
        logger.debug(`no match found`)
        return false
    }
}
function checkModelRawAttribute(field, model) {
    for (let key in model.attributes) {
        if (model.attributes[key].field && model.attributes[key].field == field) {
            return true
        }
    }
    return false
}

// Функция проверяет на существование аттрибута из search.sort[modelName] в указанной model
// и добавляет массив параметров сортировки в result в положительном случае
const addModelSortClause = (search, parentArr, obj) => {
	const modelName = getModelName(obj)
	const model = obj.model

	if (`sort` in search) {
		const pos = search.sort.models.indexOf(modelName)

		if (pos !== -1) {
            let modelChecked = false
			const fields = search.sort[modelName]
			let result = search.order[pos] = []

			for (let key in fields) {
				if (key in model.attributes) {
					const tmp = []
                    modelChecked = true
					parentArr.forEach(item => {
						tmp.push(item)
					})
					tmp.push(key, fields[key])

					result.push(tmp)
				}
			}
            if (modelChecked) {
                search.checkedModels.push(modelName)
            }
		}
	}
}

// Функция добавляет параметры limit и offset в result
// Если параметры в data не верны, то result.limit устанавливается в значение maxSQLRow
// Если limit > maxSQLRow, то result.limit устанавливается в значение maxSQLRow
const addLimits = (data, result) => {
	let check = false
	if (Array.isArray(data)) {
		if (data.length > 0) {
			if (Number.isInteger(data[0])) {
				result.limit = data[0] > maxSQLRow ? maxSQLRow : data[0]
				check = true
			}
			if (data.length > 1) {
				if (Number.isInteger(data[1])) {
					result.offset = data[1]
				}
			}
		}
	}

	if (!check) {
		result.limit = maxSQLRow
	}
}

// удаление пустых аттрибутов у родительской модели,
// если у дочерней модели будет выводиться хотя бы одно поле
const deleteAttributes = obj => {
	let needAttr = false

	if (`include` in obj) {

		if (Array.isArray(obj.include)) {
			obj.include.forEach(item => {
				deleteAttributes(item)
				needAttr = needAttr ? needAttr : checkAttributes(item)
			})
		}
		else {
			needAttr = checkAttributes(obj.include)
		}

		if (needAttr) {
			if (`attributes` in obj) {
				if (obj.attributes.length == 0) {
					delete obj.attributes
				}
			}
		}
	}
}

// удаление невостребованных ассоциированных моделей для ускорения поискового запроса
function deleteUnnecessaryIncludes(search, params) {
    logger.info(`deleteUnnecessaryIncludes:`)
    logger.debug(`search: `, JSON.stringify(search))

    const models = [...new Set(search.checkedModels)]
    const include = []

    logger.debug(models)

    params.include.forEach(item => {
        if (!(item.attributes) || (Array.isArray(item.attributes) && item.attributes.length > 0) // выводится хоть одно поле модели
            || (`required` in item && item.required == true) // используется INNER JOIN модели
            || models.includes(getModelName(item))
        ) {
            include.push(item)
        }
    })

    logger.debug(`include: `, include)

    params.include = include
}

const checkAttributes = obj => {
	if (`attributes` in obj) {
		if (obj.attributes.length > 0) {
			return true
		}
		return false
	}
	return true
}

// добавление объекта next в каждый элемент ticket.status
const getNextStatus = async (arr, userId) => {
    logger.info(`getNextStatus - `)

    logger.debug(`tickets: `, arr)

    if (arr) {
        const role = await User.getUserRole(userId)
        const roleId = await User.getUserRoleId(role)

        if (roleId !== null) {

            if (Array.isArray(arr)) {

                const ids = arr.reduce((resultArr, item) => {
                    resultArr.push(item.id)
                    return resultArr
                }, [])

                const statuses = await Status.getNextStatus(roleId, ids)

                for (let i = 0; i < arr.length; i++) {
                    arr[i][Status.name].next = getStatusDetails(arr[i].id, statuses)
                }                
            }
            else {
                await getNextStatusDetails(roleId, arr)
            }
        }
    }

    return arr
}

const getNextStatusDetails = async (roleId, ticket) => {
	if (`id` in ticket && Status.name in ticket) {
        const details = await Status.getNextStatus(roleId, ticket.id)
		ticket[Status.name].next = getStatusDetails(ticket.id, details)
	}
}

const getStatusDetails = (ticketId, data) => {
    return data.reduce((arr, item) => {
        if (item.ticketId == ticketId) {
            arr.push({id: item.id, name: item.name})
        }
        return arr
    }, [])
}

// добавление объекта customerContact в каждый элемент ticket
const getCustomerContact = async arr => {
	logger.info(`getCustomerContact - `)

	if (arr) {
		if (Array.isArray(arr)) {
			for (let i = 0; i < arr.length; i++) {
				await getFirstCustomerContact(arr[i])
			}
		}
		else {
			await getFirstCustomerContact(arr)
		}
	}

	return arr
}

const getFirstCustomerContact = async ticket => {
	ticket.customerContact = `id` in ticket ? await Contact.getFirstCustomerContact(ticket) : null
}

Ticket.tryChangeServiceType = async (id, serviceTypeId, userId) => {
	logger.info(`Ticket.tryChangeServiceType - `)
	logger.debug(id, serviceTypeId, userId)

	return sequelize.transaction(async t => {
		const ticket = await Ticket.transactionFindById(id, t)
		if (!ticket) {
			const msg = `No ticket with id: ${id} found`
			throw new sequelize.ValidationError(msg)
		};
		const params = {
			ticketId: ticket.get(`id`),
			statusId: ticket.get(`statusId`),
			performerId: ticket.get(`performerId`),
			serviceTypeId,
			userId
		}
		return Ticket.updateServiceType(params, t)
	})
}

// изменение статуса заявки
Ticket.tryChangeStatus = async data => {
	logger.info(`Ticket.tryChangeStatus - `)
	logger.debug(data)

	const id = data.ticketId
	const userId = data.userId
	const statusId = data.statusId
	const ticket = await Ticket.getTicketPerms(id, userId)

	if (ticket.perm.status == 1) {
		const role = await User.getUserRole(userId)
		const roleId = await User.getUserRoleId(role)

		if (roleId !== null) {
			let next = await Status.getNextStatus(roleId, id)
			logger.debug(`next: `, next)
			if (next.length > 0) {
				next = next.map(item => {
					return item.id
				})
				if (next.indexOf(statusId) !== -1) {
					return ticketRunLogic(data)
				}
			}
			throw new sequelize.ValidationError(`StatusId:${statusId} not allowed`)
		}
	}
	throw new sequelize.ValidationError(`Access denied`)
}

// изменение исполнителя заявки
Ticket.tryChangePerformer = async (ticketId, performerId, userId) => {
    logger.info(`Ticket.tryChangePerformer - `)
    logger.debug(ticketId, performerId, userId)

    const ticket = await Ticket.getTicketPerms(ticketId, userId)
    if (ticket.perm.setPerformer != 1) {
        throw new sequelize.ValidationError(`Permission denied`)
    }
    // проверка что новый исполнитель существует с какой-то ролью и не заблокирован
    const performerRole = await User.getUserRole(performerId)
    if (performerRole > 0) {
        return ticketRunLogic({ticketId, statusId: Status.Values.appointed, performerId, userId})
    }
    throw new sequelize.ValidationError(`Ticket's performer - unacceptable value`)
}

// получение дерева заявок
Ticket.getTree = async (ticketId, userId) => {
    logger.info(`Ticket.getTree`)
    // получение только id изначальной заявки 
    // (функция MySQL может вернуть только одно значение, не стал заморачиваться и ниже просто верну по id всё что нужно)
    const main = await sequelize.query(query.getTopTicketId, {
        replacements: [ticketId],
        type: sequelize.QueryTypes.SELECT,
        plain: true
    })

    const params = userId 
        ? await Ticket.getParams(userId, false)
        : {attributes: []}

		
	params.attributes.push(`id`, `number`, `typeId`, `statusId`, `vendorId`,`date`,`customerId`,
	`serviceTypeId`,`performerId`,`commonFieldString`,`cityId`,`serialNumber`,`equipmentId`)
    params.raw = true

    logger.trace(`tree params: `, params)
	
    if (main.id) {
        // получение id & number изначальной заявки
        const tree = await Ticket.findById(main.id, params)
        await buildTree(tree, params)
        return userId ? index.rebuildMyObject(tree) : tree
    } else {
        return main.id
    }
}
// построение дерева заявок
const buildTree = async (data, params) => {
    logger.info(`buildTree`)
    logger.debug(data)
    if (Array.isArray(data)) {
        for (const item of data) {
            await getChildren(item, params)
        }
    } else {
        await getChildren(data, params)
    }
}
// получение дочерних заявок в массив children
const getChildren = async (ticket, params) => {
    logger.info(`getChildren: `)
    logger.debug(ticket)
    ticket.children = await Ticket.findAll({where: {parentId: ticket.id}, ...params})
    logger.trace(`ticket.children: `, ticket.children)
    if (ticket.children.length > 0) {
        index.rebuildMyArray(ticket.children)
        await buildTree(ticket.children, params)
    }
}

// transaction functions
const transactionRunTicketUpdate = async (data, fields, t) => {
	const result = {}

    // обновление заявки
	result.updateTicket = await transactionUpdateTicket(data, fields, t)

    // добавление записи в историю
	if ((fields.includes(`statusId`) || fields.includes(`serviceTypeId`)) && result.updateTicket[0] > 0) {
		result.historyResult = (await History.transactionAddHistory({
			ticketId: data.ticketId,
			statusId: data.statusId,
			serviceTypeId: data.serviceTypeId,
			ownerId: data.userId,
			performerId: data.performerId
		}, t)).get({plain: true})
	}

	return result
}
const transactionUpdateTicket = (data, fields, t) => {
	return Ticket.update(data, {where: {id: data.ticketId}, fields, transaction: t})
}
Ticket.transactionUpdateTicketStatus = (data, t) => {
	return transactionRunTicketUpdate(data, [`statusId`], t)
}
Ticket.transactionCreateTicket = (params, t) => {
    // получение номера заявки
	return sequelize.query(`SELECT GetNewOrderNumber(${params.vendorId}, ${params.typeId}) as number;`, {
		type: sequelize.QueryTypes.SELECT,
		transaction: t
	}).then(res => {
		logger.trace(`result: `, res)
		if (res) {
			params.number = res[0].number

            // добавление признака гарантии
			if (`warrantyFlag` in params) {
				if (params.warrantyFlag == 1) {
					params.number += index.config.warrantyLetter
				}
			}

            // добавление признака оплачивается заказчиком
			if (`paidFlag` in params) {
				if (params.paidFlag == 1) {
					params.number += index.config.paidLetter
				}
			}

			logger.trace(`new Ticket number: `, params.number)

			return Ticket.create(params, {transaction: t})
		}

		throw new Error(`GetNewOrderNumber failed`)

	})
}
Ticket.transactionFindById = (id, t) => {
	return Ticket.findById(id, {transaction: t})
}
Ticket.updateServiceType = async (data, t) => {
	const access = await Ticket.getTicketPerms(data.ticketId, data.userId)
	if (access.perm.serviceType != 1) {
		throw new sequelize.ValidationError(`Permission denied`)
	}
	const types = await ServiceType.getAvailable(data.ticketId, t)
	if (types.length) {
		logger.debug(`available types: `, types)
		const found = types.find(item => item.id == data.serviceTypeId)
		if (found) {
			const fields = [`serviceTypeId`]
			return transactionRunTicketUpdate(data, fields, t)
		}
	}
	throw new sequelize.ValidationError(`Ticket's ServiceType changing unavailable`)
}

const ticketRunLogic = async data => {
	logger.info(`ticketRunLogic - `, data)

    const {ticketId, statusId, userId, comment} = data
	const result = {}
	const ticket = await Ticket.findById(ticketId)

	if (ticket == null) {
		throw new sequelize.ValidationError(MESSAGES.ticketNotFound)
	}

	const typeId = ticket.get(`typeId`)
	const fields = [`statusId`]
	const MESSAGES = index.config.MESSAGES
	const ErrorCommentRequired = new sequelize.ValidationError(MESSAGES.commentRequired)
	let shouldComment = false

	logger.trace(`ticket: `, ticket.get({plain: true}))
	await sequelize.transaction(async t => {
        // логика до изменения статуса заявки
		if (statusId == Status.Values.closed) {
			if ([ticketTypeValues.M, ticketTypeValues.R, ticketTypeValues.S].indexOf(typeId) > -1) {
                // проверка все ли затребованные запчасти установлены
				result.notInstalledNeedPartsCount = await NeedPart.transactionNotInstalledCount(ticketId, null)
				logger.debug(`result: `, result.notInstalledNeedPartsCount)
				if (result.notInstalledNeedPartsCount !== 0) {
					throw new sequelize.ValidationError(MESSAGES.needPartUninstalled)
				}

				if ([Status.Values.compensation, Status.Values.customerWaiting].indexOf(ticket.get(`statusId`)) > -1) {
					shouldComment = true
				} else {
					// проверка добавлены ли комментарии от инженера
					const commentCounts = await Comment.getCounts(ticketId)
					logger.trace(`commentCounts: `, commentCounts)
					result.engeneerCommentCounts = commentCounts.get(`engeneer`)
					logger.debug(`result: `, result.engeneerCommentCounts)
					if (!(parseInt(result.engeneerCommentCounts, 10) > 0)) {
						throw ErrorCommentRequired
					}
				}
			}
			if ([ticketTypeValues.M, ticketTypeValues.S].indexOf(typeId) > -1) {
                // подсчёт доступных причин неисправности
                result.reasonCount = await Reason.getCount(ticket.get(`vendorId`));
                logger.debug(`result: `, result.reasonCount);

                if (result.reasonCount !== 0) {
                    // проверка на наличие reasonId и reasonDescription в переданных данных
    				if (`reasonId` in data && `reasonDescription` in data) {
    					fields.push(`reasonId`, `reasonDescription`)
    				}
    				else {
    					throw new sequelize.ValidationError(MESSAGES.ticket.status.reasonRequired)
    				}
                }
			}
		}
		if (statusId == Status.Values.customerWaiting && typeId == ticketTypeValues.M) {
			// проверка на наличие reasonId и timeout в переданных данных
            await Timeout.build(data).validate()
		}
		if ([Status.Values.annuled, Status.Values.custRefused].indexOf(statusId) > -1) {
			shouldComment = true
		}
		if (shouldComment) {
            // проверка необходимых полей в comment
            if (!comment) throw ErrorCommentRequired
            if (!(`text` in comment) || !(`deviceId` in comment)) throw ErrorCommentRequired
        }

        // изменение статуса заявки
		data.serviceTypeId = ticket.get(`serviceTypeId`)
        if (`performerId` in data) {
            fields.push(`performerId`)
        } else {
            data.performerId = ticket.get(`performerId`)
        }
		result.statusResult = await transactionRunTicketUpdate(data, fields, t)
		logger.trace(`result: statusResult`, result.statusResult)

		if (result.statusResult.updateTicket[0] > 0) {
            // дополнительная логика по заявке после изменения статуса, в зависимости от типа
			switch (typeId) {
			case ticketTypeValues.Q:
				logger.debug(`Logic for Q orders`)
				if ([Status.Values.underway, Status.Values.shipped, Status.Values.annuled].indexOf(statusId) > -1) {
					const part = await Part.findOne({where: {ticketId}})
					if (part !== null) {
						let npStatus
						switch (statusId) {
						case Status.Values.underway:
							npStatus = NeedPart.Values.underway
							break
						case Status.Values.shipped:
							npStatus = NeedPart.Values.shipped
							break
						case Status.Values.annuled:
							npStatus = NeedPart.Values.cancelled
							break
						}
						result.NeedPartStatusResult = await NeedPart.transactionUpdateStatus(npStatus, part.get(`needPartId`), t)
					}
				}
				break
			case ticketTypeValues.T:
				logger.debug(`Logic for T orders`)
				if (statusId == Status.Values.available) {
                    // проверка на уже созданную заявку
					const rTicket = await Ticket.findOne({where: {parentId: ticketId, typeId: ticketTypeValues.R}, transaction: null})
					if (rTicket == null) {
                        // добавление R заявки
						result.createTicketR = await Ticket.transactionCreateTicket({
							typeId: ticketTypeValues.R,
							serviceTypeId: ServiceType.Values.repair,
							statusId: Status.Values.registered,
							customerId: Customer.Values.cbs,
							customerPersonId: Contact.Values.cbs,
							contractId: Contract.Values.default,
							equipmentId: Equipment.Values.default,
							onceFlag: index.config.tinyIntValues[0],
							parentId: ticketId,
							ownerId: userId,
							date: new Date(),
							vendorId: ticket.get(`vendorId`),
							cityId: ticket.get(`cityId`),
							partName: ticket.get(`partName`),
							serialNumber: ticket.get(`serialNumber`),
							partNumber: ticket.get(`partNumber`),
							blockNumber: ticket.get(`number`),
							description: ticket.get(`description`)
						}, t)
					}
				}
				break
			case ticketTypeValues.M:
                if (statusId == Status.Values.customerWaiting) {
					// добавление order_timeout
					result.createTicketTimeout = await Timeout.transactionCreateTimeout(data, t)
				}
                if (ticket.get(`statusId`) == Status.Values.customerWaiting) {
                    result.deactivateTicketTimeout = await Timeout.deactivate(ticketId, t)
                }
				break
			}
			// добавляем комментарии в зависимости от условий
			if (shouldComment) {
				result.addComment = await Comment.transactionAddComment({
                    ticketId,
                    ownerId: userId,
                    deviceId: comment.deviceId,
                    text: comment.text
                }, t)
			}
		}
	})

	return result
}