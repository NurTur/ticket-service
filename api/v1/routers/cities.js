`use strict`

const router              = require(`koa-router`)()
const City                = require(`$db_v1/city`).City
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива городов
router.get(`/`, async ctx => {
    const routeDescription = `GET cities - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, City, [`id`, `name`], [`name`])
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router