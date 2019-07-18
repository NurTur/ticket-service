`use strict`

const router              = require(`koa-router`)()
const Vendor              = require(`$db_v1/vendor`).Vendor
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива вендоров
router.get(`/`, async ctx => {
    const routeDescription = `GET vendors - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, Vendor, [`id`, `name`], [`name`])
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router