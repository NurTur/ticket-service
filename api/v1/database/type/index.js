`use strict`;

const sequelize = require(`$home`).sequelize;
const TicketType = sequelize.import(`type-definition`);

const ticketTypeValues = {
    M: 1, // По договорам
    R: 2, // На ремонт
    P: 3, // На поставку к поставщику
    S: 4, // Разовые
    Q: 5, // По оперативным поставкам запчастей
    L: 6, // На пополнение локального склада
    T: 7  // На доставку дефектов на ремонт
};

module.exports.ticketTypeValues = ticketTypeValues;
module.exports.TicketType = TicketType;