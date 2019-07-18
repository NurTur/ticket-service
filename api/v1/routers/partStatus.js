'use strict'

const router    = require(`koa-router`)()
const Status    = require(`$db_v1/part/general`).Status
const index     = require(`$home`)
const tryCatch  = index.tryCatch

// получение массива требуемых запчастей по ?ticketId
router.get(`/`, async ctx => {
    const routeDescription = `GET general part statuses - `
    const routeFunction    = async () => await index.getDictionary(
        ctx,
        Status,
        [`id`, `name`, `description`, `index`],
        [`index`],
        {index: {$not: null}}
    )

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router