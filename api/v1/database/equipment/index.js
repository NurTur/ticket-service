`use strict`;

const sequelize     = require(`$home`).sequelize;
const City          = require(`$db_v1/city`).City;
const Vendor        = require(`$db_v1/vendor`).Vendor;
const Customer      = require(`$db_v1/customer`).Customer;
const Contract      = require(`$db_v1/contract`).Contract;
const Equipment     = sequelize.import(`equipment-definition`);
const EquipmentType = sequelize.import(`equipment-type-definition`);

Equipment.belongsTo(City, {foreignKey: `cityid`});
Equipment.belongsTo(EquipmentType, {foreignKey: `typemodelid`});
Equipment.belongsTo(Customer, {foreignKey: `customerid`});
Equipment.belongsTo(Contract, {foreignKey: `service_contract_id`});
EquipmentType.belongsTo(Vendor, {foreignKey: `vendorid`});

Equipment.Values = {
    default: 0
}

EquipmentType.getByParams = ctxQuery => {
	let where = null

	if (ctxQuery.name) {
		where = {$or: [
			{name: {$like: `%${ctxQuery.name.toLowerCase()}%`}},
			{model: {$like: `%${ctxQuery.name.toLowerCase()}%`}}
		]}
	}

	if (ctxQuery.vendorId) {
		const vendorId = {vendorId: ctxQuery.vendorId}
		where = where
			? {$and: [where, vendorId]}
			: vendorId
	}

	return EquipmentType.findAll({
        attributes: [`id`, `model`, `name`],
        where,
        order: [`model`]
    })
}

module.exports.Equipment = Equipment;
module.exports.EquipmentType = EquipmentType;