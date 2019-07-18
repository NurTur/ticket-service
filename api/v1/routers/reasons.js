`use strict`;

const router              = require(`koa-router`)()
const Reason              = require(`$db_v1/reason`).Reason
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение родительских устройств по vendorId 
router.get(`/parent/:vendorId`, async ctx => {
    const routeDescription = `GET Reasons parent devices by vendorId - `
    const routeFunction    = (async () => {
        ctx.body = await Reason.getParent(ctx.params.vendorId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение дочерних устройств по parentId 
router.get(`/child/:parentId`, async ctx => {
    const routeDescription = `GET Reasons child devices by parentId - `
    const routeFunction    = (async () => {
        ctx.body = await Reason.getChildren(ctx.params.parentId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router