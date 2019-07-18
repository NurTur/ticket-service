`use strict`

const dirNames = require(`./sexy-require`)
exports.dirNames = dirNames

const Koa        = require(`koa`)
const bodyparser = require(`koa-bodyparser`)()
const json       = require(`koa-json`)
const Sequelize  = require(`sequelize`)
const cloner     = require(`cloner`)
const moment     = require(`moment`)
const config     = require(`./configs`)
exports.config   = config;

const defaultSequelizeValidationMsg = config.defaultSequelizeValidationMsg

const logger = config.logger
exports.logger = logger

// rewrited koa-logger - output to log4js
const koaLogger  = require(`./koa-logger`)

const sequelize = require(`./configs/database`)
exports.sequelize = sequelize

// общая функция обработки ошибок
// происходит проверка на sequelize.ValidationError
const errorHandler = ((ctx, mark = `Error:`, err) => {
    if (ctx) {
        if (err instanceof Sequelize.ValidationError) {
            logger.debug(err.message)
            err.errors.push(err.message)
            ctx.body = err
            ctx.status = 400
        } else {
            logger._error(mark, err)
            ctx.status = 500
        }
    } else {
        logger._error(mark, err)
    }
})
exports.errorHandler = errorHandler

// Общая функция проверки массива имён необходимых свойств(params) в объекте данных(data)
// В случае отсутствия всех необходимых параметров в объекте выбрасывается ошибка sequelize.ValidationError(msg) 
const checkRequiredParams = ((data, params, msg = defaultSequelizeValidationMsg) => {
    let check = true;
    params.forEach(function(item) {
        if (item in data) {
            if ((data[item] == null)||(data[item] == ``)) {
                check = true
            }
        } else {
            check = true
        }
    });

    if (check) {
        return check 
    } else {
        throw new sequelize.ValidationError(msg);
    }
})
exports.checkRequiredParams = checkRequiredParams

// Общая функция получения объекта разрешений для элемента модели
const getPerms = (async (id, params, Model) => {
    logger.info(`getPerms`)
    logger.debug(`Search id: ${id}, model: ${Model.name}`)

    const search  = cloner.deep.merge({where: {id}}, params)
    const _result = await Model.findOne(search)
    
    logger.debug(`Result:`)

    if (_result) {
        const result  = _result.get({plain: true})  // If plain is true, then sequelize will only return the first
                                                    // record of the result set. In case of false it will all records.
        logger.debug(result)
        return result
    } else {
        logger.debug(_result)
        throw new sequelize.ValidationError(`${Model.name} not found`);
    }
})
exports.getPerms = getPerms

// функция преобразования свойств вида `parent--son: result` в parent: {son: result} в массиве объектов
// Разделителем является global.myObjSeparator
const rebuildMyArray = (data => {
    data.forEach((item, i, arr) => {
        rebuildMyObject(item)
    })

    return data
})
exports.rebuildMyArray = rebuildMyArray

// функция преобразует элементы instance в plain JSON data
const getPlainData = (data => {
    if (Array.isArray(data)) {
        return data.map(item => {
            return item.get({plain: true})
        })
    } else {
        return data.get({plain: true})
    }
})
exports.getPlainData = getPlainData

// функция преобразования свойств вида `parent--son: result` в parent: {son: result} в объектe
// Разделителем является global.myObjSeparator
const rebuildMyObject = item => {
    const keys = Object.keys(item)
    keys.map(key => {
        if (key.search(myObjSeparator) !== -1) {
            let parent = item
            const parts = key.split(myObjSeparator)
            for (let i = 0; i < parts.length -1; i++) {
                const part = parts[i]
                if (!(part in parent)) {
                    parent[part] = {}
                }
                parent = parent[part]
            }
            parent[parts[parts.length -1]] = item[key]
            delete item[key]
        }
    })
    return item
}
exports.rebuildMyObject = rebuildMyObject

// Общая функция выполнения переданной функции через обёртку Try-Catch
const tryCatch = (async (myFunction, ctx, msg) => {
    try {
        await myFunction()
    }
    catch(err) {
        errorHandler(ctx, msg, err)
    }
})
exports.tryCatch = tryCatch

// Функция проверки строки на valid JSON 
const validateJSON = (data => {
    let obj;
    try {
        obj = JSON.parse(data)
    }
    catch(err) {
        return false
    }
    return obj
})
exports.validateJSON = validateJSON

// Функция получения корректной даты по формату
const getValidDate = ((data, format, returnNow = false) => {
    if (data == null) {
        return returnNow ? moment().format(format) : data
    } else {
        return moment(data).format(format)
    }
})
exports.getValidDate = getValidDate

// Функция получения справочника
const getDictionary = (async (ctx, Model, attributes, order, where) => {
    const checkSum = (await getTableCheckSum(Model)).Checksum
    logger.debug(`checkSum: ${JSON.stringify(checkSum)}`)
    
    if (ctx.query.checksum && checkSum && ctx.query.checksum == checkSum) {
        ctx.status = 304
    } else if (checkSum) {
        ctx.set('Data-Check-Sum', checkSum);
        ctx.body = await Model.findAll({attributes, where, order})
    } else {
        ctx.status = 500
        ctx.body = `Can't get CHECKSUM TABLE`
    }
})
exports.getDictionary = getDictionary

// Функция получения контрольной суммы таблицы
const getTableCheckSum = ((Model, transaction = null) => {
    return sequelize.query(`CHECKSUM TABLE \`${Model.getTableName()}\`;`, {plain: true, transaction});
});
exports.getTableCheckSum = getTableCheckSum;


const router = require(`./api/index`)
const app = new Koa()
app.use(bodyparser)
app.use(koaLogger())
app.use(json())
app.use(router.routes())
app.use(router.allowedMethods())

app.on(`error`, (err, ctx) => {
	errorHandler(ctx, `Server`, err)
})

module.exports.app = app