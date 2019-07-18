`use strict`;

const sequelize = require(`$home`).sequelize;
const Reason    = sequelize.import(`reason-definition`);

Reason.getParent = vendorId => {
    return Reason.findAll({
        where: {vendorId, parentId: null},
        attributes: {exclude: [`parent_id`]}
    })
};

Reason.getChildren = parentId => {
    return Reason.findAll({
        where: {parentId},
        attributes: {exclude: [`parent_id`]}
    })
};

// получение количества доступных reasons по заявке
Reason.getCount = (vendorId, transaction = null) => {
    return Reason.count({
        where: {vendorId, parentId: null},
        transaction
    })
};

module.exports.Reason = Reason;