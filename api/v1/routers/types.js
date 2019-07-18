`use strict`

const router              = require(`koa-router`)()
const Type                = require(`$db_v1/type`).TicketType
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива типов заявок
router.get(`/`, async ctx => {
    const routeDescription = `GET types - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, Type, [`id`, `name`], [`name`])
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router