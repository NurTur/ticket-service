`use strict`

const router              = require(`koa-router`)()
const Status              = require(`$db_v1/status`).Status
const User                = require(`$db_v1/user`).User
const index               = require(`$home`)
const errorHandler        = index.errorHandler
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение справочника статусов
router.get(`/`, async ctx => {
    const routeDescription = `GET all statuses - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, Status, [`id`, `name`], [`name`])
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение массива nextStatus
router.get(`/next/`, async ctx => {
    const routeDescription = `GET next status - `
    const requiredProps    = [`userId`, `ticketId`]
    const requiredPropsMsg = `Query 'userId' & 'ticketId' have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            const role   = await User.getUserRole(ctx.query.userId)
            const roleId = await User.getUserRoleId(role)
            
            ctx.body = await Status.getNextStatus(roleId, ctx.query.ticketId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router