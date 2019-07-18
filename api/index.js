const router = require(`koa-router`)()
const v1 = require(`./v1/routers/index`)

router.use(`/api/v1`, v1.routes())
router.use(`/api/v1`, v1.allowedMethods())
router.use(`*`, ctx => ctx.status = 404)

module.exports = router
