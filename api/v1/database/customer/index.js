'use strict'

const fs         = require('fs')
const index		 = require(`$home`)
const sequelize  = index.sequelize
const Customer   = sequelize.import(`customer-definition`)
const logger 	 = index.logger

const query = {
    getCustomers: fs.readFileSync(db_v1 + `customer/query/getCustomers.sql`).toString()
};

Customer.Values = {
    cbs: 12
};

Customer.getByName = (name, limit = 30000) => {
    // поговорить с Асель о неактивных заказчиках !
    logger.info(`Customer.getByName`);
    const replacements = [`%${name.toLowerCase()}%`, parseInt(limit)]
    return sequelize.query(query.getCustomers, {replacements, type: sequelize.QueryTypes.SELECT})
}

module.exports.Customer = Customer;