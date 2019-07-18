const router         = require(`koa-router`)()
const users          = require(`./users`)
const cities         = require(`./cities`)
const customers      = require(`./customers`)
const tickets        = require(`./tickets`)
const statuses       = require(`./statuses`)
const serviceTypes   = require(`./serviceTypes`)
const ticketHistory  = require(`./ticketHistory`)
const partHistory    = require(`./partHistory`)
const partStatus     = require(`./partStatus`)
const comments       = require(`./comments`)
const parts          = require(`./parts`)
const ticketTimeout  = require(`./ticketTimeout`)
const types          = require(`./types`)
const reasons        = require(`./reasons`)
const vendors        = require(`./vendors`)
const groups        = require(`./groups`)
const devices        = require(`./devices`)
const equipmentTypes = require(`./equipmentTypes`)

router.use(`/devices`, devices.routes())
router.use(`/devices`, devices.allowedMethods())

router.use(`/comments`, comments.routes())
router.use(`/comments`, comments.allowedMethods())

router.use(`/cities`, cities.routes())
router.use(`/cities`, cities.allowedMethods())

router.use(`/customers`, customers.routes())
router.use(`/customers`, customers.allowedMethods())

router.use(`/parts`, parts.routes())
router.use(`/parts`, parts.allowedMethods())

router.use(`/part-history`, partHistory.routes())
router.use(`/part-history`, partHistory.allowedMethods())

router.use(`/part-statuses`, partStatus.routes())
router.use(`/part-statuses`, partStatus.allowedMethods())

router.use(`/reasons`, reasons.routes())
router.use(`/reasons`, reasons.allowedMethods())

router.use(`/statuses`, statuses.routes())
router.use(`/statuses`, statuses.allowedMethods())

router.use(`/service-types`, serviceTypes.routes())
router.use(`/service-types`, serviceTypes.allowedMethods())

router.use(`/tickets`, tickets.routes())
router.use(`/tickets`, tickets.allowedMethods())

router.use(`/ticket-history`, ticketHistory.routes())
router.use(`/ticket-history`, ticketHistory.allowedMethods())

router.use(`/ticket-timeout`, ticketTimeout.routes())
router.use(`/ticket-timeout`, ticketTimeout.allowedMethods())

router.use(`/types`, types.routes())
router.use(`/types`, types.allowedMethods())

router.use(`/users`, users.routes())
router.use(`/users`, users.allowedMethods())

router.use(`/vendors`, vendors.routes())
router.use(`/vendors`, vendors.allowedMethods())

router.use(`/groups`, groups.routes())
router.use(`/groups`, groups.allowedMethods())

router.use(`/equipment-types`, equipmentTypes.routes())
router.use(`/equipment-types`, equipmentTypes.allowedMethods())



module.exports = router