`use strict`;

const index            = require(`$home`);
const logger           = index.logger;
const tinyIntValues    = index.config.tinyIntValues;
const iconv            = require('iconv-lite');
const ticketTypeValues = require(`$db_v1/type`).ticketTypeValues;
const moment        = require(`moment`);

module.exports = function(sequelize, DataTypes) {
    const typeValues = Object.values(ticketTypeValues);

    return sequelize.define(`ticket`, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `parentorderid`,
            validate: {isInt: {msg: `Ticket's parentId value have to be of type INTEGER`}}
        },
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `ordertypeid`,
            validate: {
                isInt: {msg: `Ticket's statusId value have to be of type INTEGER`},
                isIn: {args: [typeValues], msg: `Ticket's type value have to be one of the values: ` + typeValues},
            }
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `statusid`,
            validate: {isInt: {msg: `Ticket's statusId value have to be of type INTEGER`}}
        },
        sellerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `seller_id`,
            validate: {isInt: {msg: `Ticket's sellerId value have to be of type INTEGER`}}
        },
        sellerPersonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `seller_cperson_id`,
            validate: {isInt: {msg: `Ticket's sellerPersonId value have to be of type INTEGER`}}
        },
        number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: `ordernumber`,
            validate: {notEmpty: {msg: `Ticket's number value can't be empty`}}
        },
        invoiceDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            field: `invoicedate`,
            validate: {isDate: {msg: `Ticket's invoiceDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`invoiceDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        numberFromCustomer: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `onbycustomer`
        },
        date: { // дата подачи заявки
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: `orderdate`,
            validate: {isDate: {msg: `Ticket's date value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`date`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `cityid`,
            validate: {isInt: {msg: `Ticket's cityId value have to be of type INTEGER`}}
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `customerid`,
            validate: {isInt: {msg: `Ticket's customerId value have to be of type INTEGER`}}
        },
        customerPersonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `cpersonid`,
            validate: {isInt: {msg: `Ticket's customerPersonId value have to be of type INTEGER`}}
        },
        contractId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `contractid`,
            validate: {isInt: {msg: `Ticket's contractId value have to be of type INTEGER`}}
        },
        vendorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `vendorid`,
            validate: {isInt: {msg: `Ticket's vendorId value have to be of type INTEGER`}}
        },
        equipmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `equipmentid`,
            validate: {isInt: {msg: `Ticket's equipmentId value have to be of type INTEGER`}}
        },
        partName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `partname`
        },
        partNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `partnumber`
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `serialnumber`
        },
        blockNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            field: `blocknumber`
        },
        warrantyFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `warranty`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's warrantyFlag value have to be one of values: ` + tinyIntValues}}
        },
        cbsWarrantyFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `cbswarranty`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's cbsWarrantyFlag value have to be one of values: ` + tinyIntValues}}
        },
        commonFieldString: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            field: `sordernumber`
        },
        equipSupplierId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `equipsupplierid`,
            validate: {isInt: {msg: `Ticket's equipSupplierId value have to be of type INTEGER`}}
        },
        serviceTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `servicetypeid`,
            validate: {isInt: {msg: `Ticket's serviceTypeId value have to be of type INTEGER`}}
        },
        description: {
            type: DataTypes.BLOB,
            allowNull: true,
            defaultValue: null,
            get: function() {
                const _description = this.getDataValue(`description`);
                // 'this' allows you to access attributes of the instance
                if (_description) {
                    return iconv.decode(_description, `win1251`);
                } else {
                    return _description;
                };
            },
            set: function(val) {
                this.setDataValue(`description`, iconv.encode(val, `win1251`));
            }
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: `ownerid`,
            validate: {isInt: {msg: `Ticket's ownerid value have to be of type INTEGER`}}
        },
        performerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `performerid`,
            validate: {isInt: {msg: `Ticket's performerId value have to be of type INTEGER`}}
        },
        billNumber: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: null,
            field: `billnumber`
        },
        billDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
            field: `billdate`,
            validate: {isDate: {msg: `Ticket's billDate value have to be of type DATE`}},
			set(val) {
				this.setDataValue(`billDate`, index.getValidDate(val, `YYYY-MM-DD`));
			}
        },
        onceFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `once`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's onceFlag value have to be one of values: ` + tinyIntValues}}
        },
        checkedFlag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `checked`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's checkedFlag value have to be one of values: ` + tinyIntValues}}
        },
        paidFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `paid_by_customer`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's paidFlag value have to be one of values: ` + tinyIntValues}}
        },
        subcontractorFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `subcontractor`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's subcontractorFlag value have to be one of values: ` + tinyIntValues}}
        },
        retryFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `retry`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's retryFlag value have to be one of values: ` + tinyIntValues}}
        },
        archivedFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `archived`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's archivedFlag value have to be one of values: ` + tinyIntValues}}
        },
        frozenFlag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: `frozen`,
            validate: {isIn: {args: [tinyIntValues], msg: `Ticket's frozenFlag value have to be one of values: ` + tinyIntValues}}
        },
        failDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            field: `fail_description`
        },
        repairPrice: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            field: `price`
        },
        diagPrice: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
            field: `diagnostics`
        },
        reasonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            field: `reason_id`,
            validate: {isInt: {msg: `Ticket's reasonId value have to be of type INTEGER`}}
        },
        reasonDescription: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: null,
            field: `reason_description`
        },
        hash: {
            type: DataTypes.STRING(40),
            allowNull: true,
            defaultValue: null,
            field: `hash`
        },
        detailsHash: {
            type: DataTypes.STRING(40),
            allowNull: true,
            defaultValue: null,
            field: `details_hash`
        },
        perm: {
            type: DataTypes.VIRTUAL
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        tableName: 'orders'
    })
}
