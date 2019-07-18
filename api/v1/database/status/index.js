`use strict`;

const fs        = require(`fs`);
const sequelize = require(`$home`).sequelize;
const Status    = sequelize.import(`status-definition`);

const query     = {
    getNextStatus: fs.readFileSync(db_v1 + `status/query/getNextStatus.sql`).toString()
};

Status.Values = {
    registered     : 1,  // Зарегистрирована
    appointed      : 3,  // Назначен Исполнитель
    partWaiting    : 4,  // Ожидание запчасти
    handled        : 5,  // Принята к исполнению
    customerWaiting: 6,  // Ожидание заказчика
    closed         : 7,  // Закрыта
    annuled        : 19, // Аннулирована
    custRefused    : 20,  // Отказ заказчика
    underway       : 22, // В работе
    compensation   : 25, // Компенсация
    cancelled      : 28, // Отменено
    shipped        : 29, // Отгружено
    available      : 30  // Доступно
};

Status.getNextStatus = ((roleId, ticketId) => {
    return sequelize.query(query.getNextStatus, { replacements: [roleId, ticketId], type: sequelize.QueryTypes.SELECT});
});

module.exports.Status = Status;
