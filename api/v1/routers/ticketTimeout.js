`use strict`

const router = require(`koa-router`)()
const Timeout = require(`$db_v1/ticketTimeout`).Timeout
const Reason = require(`$db_v1/ticketTimeout`).Reason
const index = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch = index.tryCatch

router.get(`/`, async ctx => {
	const routeDescription = `GET ticket-timeout - `
	const requiredProps = [`ticketId`]
	const requiredPropsMsg = `Query "ticketId" have to be specified`
	
	const routeFunction = async () => {
		if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
			ctx.body = await Timeout.getAll(140354/*ctx.query.ticketId*/)
		}
	}

	await tryCatch(routeFunction, ctx, routeDescription)
})
router.put(`/`, async ctx => {
	const routeDescription = `PUT ticket-timeout - `
	const requiredProps = [`ticketId`, `reasonId`, `timeout`, `userId`]
	const requiredPropsMsg = `Params "${requiredProps.join(`, `)}" have to be specified`
	const routeFunction = async () => {
		if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
			ctx.body = await Timeout.create(ctx.request.body)
		}
	}

	await tryCatch(routeFunction, ctx, routeDescription)
})
// получение массива reasons
router.get(`/reasons`, async ctx => {
	const routeDescription = `GET ticketTimeout reasons - `
	const routeFunction = async () => {
		ctx.body = await Reason.findAll()
	}

	await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router
