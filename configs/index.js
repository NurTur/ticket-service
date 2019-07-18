`use strict`

const dirNames = require(`$home`).dirNames
const u        = require(`nodejs-utils`)
const path     = require(`path`)
const messages = require(`./messages`)

// объявление глобальных переменных
global.db_v1          = dirNames.$db_v1
global.myObjSeparator = `--`
global.sqzeModelSeparator = `->`
global.maxSQLRow      = 500

// сообщения для пользователей
exports.MESSAGES = messages

exports.tinyIntValues = [0, 1]

exports.warrantyLetter = `W`
exports.paidLetter = `$`

exports.defaultSequelizeValidationMsg = `Not all required parameters specified`;

exports.ticketTimeoutComment = `Ожидание заказчика до date по причине "reason".`;
exports.partCancellationComment = `Заказчик отменил запрос запчасти`;

// logger configuration
u.configureLogger(path.join(__dirname, `log4js.json`))
const logger = u.logger
logger._error = ((mark, err) => {logger.error(mark, err)})
exports.logger = logger