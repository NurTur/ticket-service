`use strict`

const router              = require(`koa-router`)()
const ServiceType         = require(`$db_v1/serviceType`).ServiceType
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива вида работ
router.get(`/`, async ctx => {
    const routeDescription = `GET serviceTypes - `
    const routeFunction    = (async () => {
        if (`ticketId` in ctx.query) {
            // получение доступных для заявки видов работ
            ctx.body = await ServiceType.getAvailable(ctx.query.ticketId) 
        } else {
            // получение справочника вида работ
            await index.getDictionary(ctx, ServiceType, [`id`, `name`], [`name`])
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router