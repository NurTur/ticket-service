'use strict'

const router              = require(`koa-router`)()
const EquipmentType       = require(`$db_v1/equipment`).EquipmentType
const index               = require(`$home`)
const tryCatch            = index.tryCatch

// получение массива типов оборудования по вендору и имени
router.get(`/`, async ctx => {
    const routeDescription = `GET equipmentType - `
    const routeFunction = async () => {ctx.body = await EquipmentType.getByParams(ctx.query)}

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router