'use strict'

const router = require(`koa-router`)()
const {GeneralPart} = require(`$db_v1/part/general`)
const {InstPart} = require(`$db_v1/part/installed`)
const {NeedPart} = require(`$db_v1/part/need`)
const {Device} = require(`$db_v1/part/unit`)
const {Unit} = require(`$db_v1/part/unit`)
const index = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch = index.tryCatch

// NEED
// получение массива требуемых запчастей по ?ticketId
router.get(`/need/`, async ctx => {
    const routeDescription = `GET needParts by ticketId - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `ticketId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await NeedPart.getAll(ctx.query.ticketId, ctx.query.userId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// сохранение новой затребованной запчасти
router.post(`/need/`, async ctx => {
    const routeDescription = `POST needParts - `
    const requiredProps    = [`ticketId`, `userId`, `comment`]
    const requiredPropsMsg = `NeedPart's ticketId, userId and comment have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await NeedPart.tryCreate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// получение массива требуемых запчастей для установленных по ?ticketId
router.get(`/need/install/`, async ctx => {
    const routeDescription = `GET needParts to install by ticketId - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `ticketId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await NeedPart.getToInstall(ctx.query.ticketId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// обновление статуса запчасти по id заявки
router.put(`/need/status/`, async ctx => {
    const routeDescription = `PUT needPart's status - `
    const requiredProps    = [`id`, `statusId`, `userId`]
    const requiredPropsMsg = `NeedPart's id, statusId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await NeedPart.tryUpdate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})


// GENERAL
// получение запчасти по id
router.get(`/general/:id`, async ctx => {
    const routeDescription = `Get generalPart by id - `
    const routeFunction    = (async () => {
        ctx.body = await GeneralPart.getById(ctx.params.id)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// получение массива запчастей по ?ticketId
router.get(`/general/`, async (ctx, next) => {
	if (!ctx.query.ticketId) return next()
    const routeDescription = `GET generalParts by ticketId - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `ticketId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await GeneralPart.getAll(ctx.query.ticketId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// получение запчасти по ?needPartId
router.get(`/general/`, async ctx => {
    const routeDescription = `GET generalParts by needPartId - `
    const requiredProps    = [`needPartId`]
    const requiredPropsMsg = `needPartId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await GeneralPart.getByNeedPartID(ctx.query.needPartId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// сохранение новой запчасти
router.post(`/general/`, async ctx => {
    const routeDescription = `POST generalParts - `
    const requiredProps    = [`ticketId`, `userId`]
    const requiredPropsMsg = `GeneralPart's ticketId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await GeneralPart.tryCreate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// обновление запчасти по id
router.put(`/general/`, async ctx => {
    const routeDescription = `PUT generalPart - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `GeneralPart's id and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await GeneralPart.tryUpdate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// удаление запчасти по id
router.delete(`/general/`, async ctx => {
    const routeDescription = `DELETE generalPart by id - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `GeneralPart's id and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await GeneralPart.tryDelete(ctx.query)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})


// INSTALLED
// получение запчасти по id
router.get(`/installed/:id`, async ctx => {
    const routeDescription = `Get instPart by id - `
    const routeFunction    = (async () => {
        ctx.body = await InstPart.getById(ctx.params.id)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// получение массива установленных запчастей по ?ticketId
router.get(`/installed/`, async ctx => {
    const routeDescription = `GET instParts by ticketId - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `ticketId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await InstPart.getAll(ctx.query.ticketId, ctx.query.userId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// сохранение новой установленной запчасти
router.post(`/installed/`, async ctx => {
    const routeDescription = `POST instParts - `
    const requiredProps    = [`ticketId`, `userId`]
    const requiredPropsMsg = `InstPart's ticketId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await InstPart.tryCreate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// обновление запчасти по id
router.put(`/installed/`, async ctx => {
    const routeDescription = `PUT instPart - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `InstPart's id and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await InstPart.tryUpdate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// удаление запчасти по id
router.delete(`/installed/`, async ctx => {
    const routeDescription = `DELETE instPart by id - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `InstPart's id and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await InstPart.tryDelete(ctx.query)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})


// DEVICES
// получение родительских устройств по vendorId
router.get(`/devices/`, async ctx => {
    const routeDescription = `GET part devices by vendorId - `
    const requiredProps    = [`vendorId`]
    const requiredPropsMsg = `Devices vendorId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await Device.getByVendorId(ctx.query.vendorId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// получение дочерних устройств по parentId
router.get(`/units/`, async ctx => {
    const routeDescription = `GET part units by deviceId - `
    const requiredProps    = [`vendorId`, `deviceId`]
    const requiredPropsMsg = `Unitses vendorId & deviceId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await Unit.getByDeviceId(ctx.query.vendorId, ctx.query.deviceId, ctx.query.supplies)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router
