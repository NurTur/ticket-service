`use strict`;

const router              = require(`koa-router`)()
const Customer            = require(`$db_v1/customer`).Customer
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение массива заказчиков
router.get(`/`, async ctx => {
    const routeDescription = `GET customers - `
    const requiredProps    = [`name`]
    const requiredPropsMsg = `Customer's name have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await Customer.getByName(ctx.query.name, ctx.query.limit)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router