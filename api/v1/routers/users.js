'use strict';

const router              = require(`koa-router`)()
const User                = require(`$db_v1/user`).User
const index               = require(`$home`)
const checkRequiredParams = index.checkRequiredParams
const tryCatch            = index.tryCatch

// получение массива пользователей по имени и департаменту
router.get(`/`, async ctx => {
    const routeDescription = `GET users - `
    const routeFunction = (async () => {ctx.body = await User.getByParams(ctx.query)})

    await tryCatch(routeFunction, ctx, routeDescription)
})

// проверка пользователя по ?login&password
router.get(`/autorize`, async ctx => {
    const routeDescription = `GET user by login and password - `
    const requiredProps    = [`login`, `password`]
    const requiredPropsMsg = `User's login and password have to be specified`
    const routeFunction    = (async () => {
        if (checkRequiredParams(ctx.query, requiredProps, requiredPropsMsg)) {
            ctx.body = await User.autorize(ctx.query.login, ctx.query.password)
        }
    })

    await tryCatch(routeFunction, ctx, routeDescription)
})

module.exports = router