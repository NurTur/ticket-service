`use strict`

const router              = require(`koa-router`)()
const History             = require(`$db_v1/ticketHistory`).History
const index               = require(`$home`)
const errorHandler        = index.errorHandler
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение массива элементов истории заявки
router.get(`/`, async ctx => {
    const routeDescription = `GET ticketHistory - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `Query 'ticketId' have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.getAll(ctx.query.ticketId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение строки закрытия заявки из истории
router.get(`/closed`, async ctx => {
    const routeDescription = `GET ticketHistory closed item - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `Query 'ticketId' have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.getClosed(ctx.query.ticketId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router