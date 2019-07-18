`use strict`

const moment = require(`moment`)
const index = require(`$home`)
const logger = index.logger
const sequelize = index.sequelize
const CommentObj = require(`$db_v1/comment`)
const Timeout = sequelize.import(`timeout-definition`)
const Reason = sequelize.import(`reason-definition`)

Timeout.belongsTo(Reason, {foreignKey: `reasonId`})

// transaction functions
const transactionUpdateTimeout = (params, fields, t) => 
	Timeout.update(params, {where: {ticketId: params.ticketId}, fields, transaction: t})
const transactionCreateTimeout = (params, t) =>
	Timeout.upsert(params, {fields: [`ticketId`, `reasonId`, `timeout`, `append`, `activeFlag`, `notification`, `alert`], transaction: t})

Timeout.transactionCreateTimeout = async (params, t) => {
	const result = {}

    // подготовка комментария
	let comment = index.config.ticketTimeoutComment.replace(`date`, moment(params.timeout).format(`DD.MM.YYYY`))
	const reason = await Reason.findOne({where: {id: params.reasonId}, plain: true})

	if (reason !== null) {
		const name = reason.get(`name`)
		logger.trace(`reasonName - `, name)
		comment = comment.replace(`reason`, name)
		logger.trace(`comment - `, comment)
	}
	else {
		throw new sequelize.ValidationError(`Timeout - Incorrect reasonId`)
	}

	result.deactivateCurrentTimeout = await Timeout.deactivate(params.ticketId, t)

    // Returns: Returns a boolean indicating whether the row was created or updated.
	const createResult = await transactionCreateTimeout({
		ticketId: params.ticketId,
		reasonId: params.reasonId,
		timeout: params.timeout,
		append: null,
		notification: null,
		alert: null,
		activeFlag: index.config.tinyIntValues[1]
	}, t)

	result.createTimeout = createResult ? `created` : `updated`

	result.addComment = await CommentObj.Comment.transactionAddComment({
		ticketId: params.ticketId,
		ownerId: params.userId,
		text: comment
	}, t)

	return result
}
Timeout.create = params => sequelize.transaction(t => Timeout.transactionCreateTimeout(params, t))
Timeout.getAll = async (ticketId) => {
	const timeouts = await Timeout.findAll({
		where: {
			ticketId,
			activeFlag: index.config.tinyIntValues[1]
		}
	})
	if (timeouts.length > 1) {
		throw new sequelize.ValidationError(`Expected one record but got.`)
	}
	return timeouts
}
Timeout.deactivate = (ticketId, t) => transactionUpdateTimeout({
		activeFlag: index.config.tinyIntValues[0],
		ticketId
	}, [`activeFlag`], t)

module.exports.Timeout = Timeout
module.exports.Reason = Reason
