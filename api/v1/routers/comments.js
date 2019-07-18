`use strict`;

const router              = require(`koa-router`)()
const Comment             = require(`$db_v1/comment`).Comment
const Device              = require(`$db_v1/comment`).Device
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение одного комментария по id
router.get(`/:id`, async ctx => {
    const routeDescription = `GET сomment by id - `
    const routeFunction    = (async () => {
        ctx.body = await Comment.getById(ctx.params.id)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение массива комментариев по ?ticketId
router.get(`/`, async ctx => {
    const routeDescription = `GET comments by ticketId - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `ticketId have to be specified`
   
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await Comment.getByType(ctx.query.ticketId, ctx.query.userId, ctx.query.type)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// сохранение нового комментария
router.post(`/`, async ctx => {
    const routeDescription = `POST comments - `
    const requiredProps    = [`ticketId`]
    const requiredPropsMsg = `Comment's ticketId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await Comment.tryCreate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// обновление комментария по id
router.put(`/`, async ctx => {
    const routeDescription = `PUT comments - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `Comment's id and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await Comment.tryUpdate(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})
// удаление комментария по id
router.delete(`/`, async ctx => {
    const routeDescription = `DELETE сomment by id - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `Comment's id & userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await Comment.tryDelete({id: ctx.query.id, userId: ctx.query.userId})
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение количества комментариев по типам через ticketId 
router.get(`/count/:ticketId`, async ctx => {
    const routeDescription = `GET сomments count by ticketId - `
    const routeFunction    = (async () => {
        ctx.body = await Comment.getCounts(ctx.params.ticketId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение родительских устройств по vendorId 
router.get(`/devices/parent/:vendorId`, async ctx => {
    const routeDescription = `GET Comments parent devices by vendorId - `
    const routeFunction    = (async () => {
        ctx.body = await Device.getCompleteParents(ctx.params.vendorId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение дочерних устройств по parentId 
router.get(`/devices/child/:parentId`, async ctx => {
    const routeDescription = `GET Comments child devices by parentId - `
    const routeFunction    = (async () => {
        ctx.body = await Device.findAll({
            where: {parentId: ctx.params.parentId},
            attributes: {exclude: [`parent_id`]},
            order: [`name`],
        })
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router