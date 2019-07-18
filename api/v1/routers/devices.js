`use strict`

const router              = require(`koa-router`)()
const Device                = require(`$db_v1/device`).Device
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива 
router.get(`/`, async ctx => {
    const routeDescription = `GET devices - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, Device, [`id`, `name`,`parentId`,`vendorId`], [`name`])
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router