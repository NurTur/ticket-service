`use strict`;

const Vendor     = require(`$db_v1/vendor`).Vendor;
const index      = require(`$home`)
const sequelize  = index.sequelize;
const logger     = index.logger;
const Unit       = sequelize.import(`unit-definition`);
const Device     = sequelize.import(`device-definition`);

Unit.belongsTo(Device, {as:`parent`, foreignKey: `deviceid`});
Device.hasMany(Unit, {as:`children`, foreignKey: `deviceid`});

Device.getAll = (() => {
    return Device.findAll();
});

Device.getByVendorId = (vendorId => {
    logger.info(`Device.getByVendorId - `, vendorId);
    
    const params = {
        include: [{
            model: Unit,
            as: `children`,
            attributes: [],
            where: {vendorId}
        }]
    };

    logger.debug(`params`, params);
    return Device.findAll(params);
});

Unit.getByDeviceId = (vendorId, deviceId, supplies = false) => {
    logger.info(`Unit.getByDeviceId - `, vendorId, deviceId);
    
    const params = {
        attributes: [`id`, `name`, `noOrderFlag`]
    };
    params.where = (supplies) ? {vendorId: {$in: [vendorId, Vendor.values.general]}, deviceId} : {vendorId, deviceId}

    logger.debug(`params`, params);
    return Unit.findAll(params);
};

module.exports.Unit   = Unit;
module.exports.Device = Device; 