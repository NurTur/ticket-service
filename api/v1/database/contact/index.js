`use strict`;

const sequelize  = require(`$home`).sequelize;
const Contact    = sequelize.import(`contact-definition`);

Contact.Values = {
    cbs: 9669
};

Contact.getFirstCustomerContact = (async (ticket) => {
    const Ticket = require(`$db_v1/ticket`).Ticket;
    const params = {
        include: {
            model: Ticket,
            attributes: [],
            require: true,
            where: {
                id: ticket.id
            }
        }
    };

    Contact.belongsTo(Ticket, {foreignKey: `customerId`, targetKey: `customerId`});
    
    return Contact.findOne(params);
});

module.exports.Contact = Contact;