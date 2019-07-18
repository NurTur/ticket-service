'use strict';

const router              = require(`koa-router`)()
const Groups                = require(`$db_v1/groups`).Groups
const index               = require(`$home`)
const tryCatch            = index.tryCatch


router.get(`/`, async ctx => {

    const routeDescription = `GET groups - `
    const routeFunction    = (async () => {
        await index.getDictionary(ctx, Groups, [`id`, `weight`,`name`,`userslist`,`actionslist`], [`weight`,`name`,`userslist`,`actionslist`])
    });
    await tryCatch(routeFunction, ctx, routeDescription)

})

module.exports = router