'use strict'

const router              = require(`koa-router`)()
const Ticket              = require(`$db_v1/ticket`).Ticket
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение массива заявок
router.get(`/`, async ctx => {
    const routeDescription = `GET tickets - `
    const requiredProps    = [`fields`]
    const requiredPropsMsg = `Query 'fields' have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            // раскомментить после исправления бага в sequelize
             /*ctx.body = `simple-search` in ctx.query
                 ? await Ticket.getAll_SimpleSearch(ctx.query)
                 : await Ticket.getAll_DualSearch(ctx.query)*/
            ctx.body = await Ticket.getAll_DualSearch(ctx.query, ctx.query.userId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// // сохранение новой заявки
// router.post(`/`, async ctx => {
//     const routeDescription = `POST tickets - `
//     const requiredProps    = [`ownerId`]
//     const requiredPropsMsg = `Ticket's ownerId have to be specified`
//     const routeFunction    = (async () => {
//         if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
//             ctx.body = await Ticket.tryCreate(ctx.request.body)
//         }
//     })

//     await tryCatch(routeFunction, ctx, routeDescription)
// })

// получение дерева заявок по ticketId
router.get(`/tree/:ticketId`, async ctx => {
    const routeDescription = `GET ticket's tree - `
    const routeFunction    = (async () => {
        ctx.body = await Ticket.getTree(ctx.params.ticketId, ctx.query.userId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)    
})

// обновление статуса заявки по ticketId
router.put(`/status/`, async ctx => {
    const routeDescription = `PUT ticket's status - `
    const requiredProps    = [`ticketId`, `statusId`, `userId`]
    const requiredPropsMsg = `Ticket's ticketId, statusId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await Ticket.tryChangeStatus(ctx.request.body)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)    
})

// обновление вида работ заявки по ticketId
router.put(`/service-type/`, async ctx => {
    const routeDescription = `PUT ticket's serviceType - `
    const requiredProps    = [`ticketId`, `serviceTypeId`, `userId`]
    const requiredPropsMsg = `Ticket's ticketId, serviceTypeId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await Ticket.tryChangeServiceType(ctx.request.body.ticketId, ctx.request.body.serviceTypeId, ctx.request.body.userId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)    
})

// обновление исполнителя заявки по ticketId
router.put(`/performer/`, async ctx => {
    const routeDescription = `PUT ticket's performer - `
    const requiredProps    = [`ticketId`, `performerId`, `userId`]
    const requiredPropsMsg = `Ticket's ticketId, performerId and userId have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            const {ticketId, performerId, userId} = ctx.request.body
            ctx.body = await Ticket.tryChangePerformer(ticketId, performerId, userId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)    
})

// получение одной заявки
router.get(`/:id`, async ctx => {
    const routeDescription = `GET ticket by id - `
    const routeFunction    = (async () => {
        ctx.body = await Ticket.getById(ctx.params.id, ctx.query.userId)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router