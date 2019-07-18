'use strict'

const router              = require(`koa-router`)()
const History             = require(`$db_v1/part/general/history`).History
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение элемента истории part по id
router.get(`/:id`, async ctx => {
    const routeDescription = `GET partHistory by id - `
    const routeFunction    = (async () => {    
        ctx.body = await History.getById(ctx.params.id)
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// получение массива элементов истории part
router.get(`/`, async ctx => {
    const routeDescription = `GET partHistory by partId - `
    const requiredProps    = [`partId`]
    const requiredPropsMsg = `Query 'partId' have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.getAll(ctx.query.partId)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

// сохранение нового элемента истории запчасти
router.post(`/`, async ctx => {
    const routeDescription = `POST partHistory - `
    const requiredProps    = [`partId`, `userId`]
    const requiredPropsMsg = `PartHistory's partId and userId have to be specified`
    const routeFunction    = async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.tryCreate(ctx.request.body)
        }
    }

    await tryCatch(routeFunction, ctx, routeDescription)
})

// обновление элемента истории запчасти по id
router.put(`/`, async ctx => {
    const routeDescription = `PUT partHistory - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `PartHistory's id and userId have to be specified`
    const routeFunction    = async () => {
        if (checkRequiredParams(ctx.request.body, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.tryUpdate(ctx.request.body)
        }
    }

    await tryCatch(routeFunction, ctx, routeDescription)
})
// удаление элемента истории запчасти по id
router.delete(`/`, async ctx => {
    const routeDescription = `DELETE partHistory by id - `
    const requiredProps    = [`id`, `userId`]
    const requiredPropsMsg = `PartHistory's id and userId have to be specified`
    const routeFunction    = async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await History.tryDelete(ctx.query)
        }
    }

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router