`use strict`;

const cloner    = require(`cloner`);
const Sequelize = require(`sequelize`);
const index     = require(`$home`);
const logger    = index.logger;
const sequelize = index.sequelize;
const User      = require(`$db_v1/user`).User;
const Ticket    = require(`$db_v1/ticket`).Ticket;
const Status    = require(`$db_v1/status`).Status;
const Comment   = sequelize.import(`comment-definition`);
const Device    = sequelize.import(`comment-device-definition`);
const Parent    = sequelize.import(`comment-device-definition`);

Comment.belongsTo(User, {foreignKey: `ownerid`});
Comment.belongsTo(Device, {foreignKey: `device_id`});
Device.belongsTo(Parent, {as: `parent`, foreignKey: `parent_id`});
Parent.hasMany(Device, {as: `haveChildren`, foreignKey: 'parent_id', sourceKey: 'id'});
Comment.belongsTo(Ticket, {foreignKey: `orderid`});

const typeValues = require(`./commentType`);

const baseParams = {
    attributes: {
        include: [],
        exclude: [`ownerid`, `orderid`, `device_id`]
    },
    include: [
        {
            model: User,
            attributes: [`id`, `name`]
        },
        {
            model: Device,
            attributes: [`id`, `name`],
            include: [
                {
                    model: Parent,
                    attributes: [`id`, `name`],
                    as: `parent`
                }
            ]
        }
    ]
};

// gets a compatible commentType for user cpecified or throws a validationError instead
const getCommentType = (async (userId, commentType) => {
    logger.debug('Comment.getCommentType');
    logger.debug(userId, commentType)

    const msg = `Incorrect comment's ownerId-commentType compliance`;

    switch(userId) {
        case null:
            if ([typeValues.announce, typeValues.service].indexOf(commentType) == -1) {
                throw new sequelize.ValidationError(msg);
            } else {
                return commentType;
            }
            break;
        default:
            const role = await User.getUserRole(userId);
            switch(role) {
                case User.RoleValues.unset:
                    throw new sequelize.ValidationError(msg);
                    break;
                case User.RoleValues.director:
                case User.RoleValues.engineer:
                case User.RoleValues.headOfDepartment:
                case User.RoleValuesseniorEngineer:
                    return typeValues.engineer;
                    break;
                case User.RoleValues.coordinator:
                case User.RoleValues.seniorCoordinator:
                    return typeValues.coordinator
                    break;
                case User.RoleValues.administrator:
                    if ([typeValues.engineer, typeValues.coordinator].indexOf(commentType) == -1) {
                        return typeValues.engineer;
                    } else {
                        return commentType;
                    }
                    break;
            }
    }
});

Comment.getParams = (async (userId, paramsFlag) => {
    const role = await User.getUserRole(userId);
    
    const permParams = {
        attributes: [
            [Sequelize.fn(`IF`, Sequelize.literal(`\`ticket${sqzeModelSeparator}status\`.\`final\` = 1`), 0,
                Sequelize.fn(`IF`, {comment_type: {$notIn: [typeValues.engineer, typeValues.coordinator]}}, 0,
                    Sequelize.fn(`IF`, Sequelize.literal(`\`comment\`.\`ownerid\` = ${userId}`), 1, 0)
                
            )), `perm.edit`]
        ],
        include: [
            {
                model: Ticket,
                attributes: [],
                include: [
                    {
                        model: Status,
                        attributes: []
                    }
                ]
            }
        ]
    };

    switch(paramsFlag) {
        case true: 
            const tmp = cloner.deep.copy(baseParams);
            tmp.attributes.include.push(permParams.attributes[0]);
            tmp.include.push(permParams.include[0]);
            
            return tmp;
            break;
        default: return permParams;
    };
});

Comment.getCounts = (ticketId => {
    return Comment.findAll({
        attributes: [
            [Sequelize.fn(`COUNT`, Sequelize.col(`id`)), `total`],
            [Sequelize.fn(`IFNULL`, Sequelize.fn(`SUM`, Sequelize.fn(`IF`, { comment_type: typeValues.engineer }, 1, 0)), 0), `engeneer`],
            [Sequelize.fn(`IFNULL`, Sequelize.fn(`SUM`, Sequelize.fn(`IF`, { comment_type: typeValues.coordinator }, 1, 0)), 0), `coordinator`],
            [Sequelize.fn(`IFNULL`, Sequelize.fn(`SUM`, Sequelize.fn(`IF`, { comment_type: typeValues.announce }, 1, 0)), 0), `notification`],
            [Sequelize.fn(`IFNULL`, Sequelize.fn(`SUM`, Sequelize.fn(`IF`, { comment_type: typeValues.service }, 1, 0)), 0), `service`]
        ],
        where: { ticketId }, 
        plain: true
    })
});

Comment.getByType = (async (ticketId, userId, commentType) => {
    let where = { ticketId };

    if (commentType) {
        where.type = commentType;
    };
    console.log("------------Erlan ",userId,"---------------");
    const params = userId
        ? await Comment.getParams(userId, true)
        : baseParams
        console.log("------------Nurbo1 ",params.include[0].attributes,"---------------");
        console.log("------------Nurbo2 ",params.include[1].include,"---------------");
        console.log("------------Nurbo3 ",params.include[1].attributes,"---------------");
        console.log("------------Nurbo4 ",params.include[2].include,"---------------");
        console.log("------------Nurbo5 ",params.attributes.include[0],"---------------");    
    const search = cloner.deep.merge({where}, params);
    return Comment.findAll(search);
});

Comment.getById = (async (id) => {
    const params = cloner.deep.copy(baseParams);
    const search = cloner.deep.merge({where: {id}}, params);

    return Comment.findOne(search);
});

Comment.tryCreate = (async (data) => {
    const userId = (data.ownerId) ? data.ownerId : null;
    data.type    = await getCommentType(userId, data.type);
    const ticket = await Ticket.getTicketPerms(data.ticketId, userId);

    if (ticket.perm.comment == 1) {
        return Comment.create(data);
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

Comment.tryUpdate = (async data => {
    const id      = data.id;
    const params  = await Comment.getParams(data.userId, false);
    const comment = await index.getPerms(id, params, Comment);

    if (comment.perm.edit == 1) {
        return Comment.update(data, {where : {id}, fields: [`text`, `deviceId`]});
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

Comment.tryDelete = (async data => {
    const id      = data.id;
    const params  = await Comment.getParams(data.userId, false);
    const comment = await index.getPerms(id, params, Comment);

    if (comment.perm.edit == 1) {
        return Comment.destroy({where: {id}}, {force: true})
    } else {
        throw new sequelize.ValidationError(`Access denied`);
    };
});

Device.getCompleteParents = async vendorId => {
    const _devices = await Parent.findAll({
        include: [{model: Device, as: `haveChildren`}],
        where: {vendorId, parentId: null},
        attributes: {exclude: [`parent_id`]},
        order: [`name`],
    })

    const devices = index.getPlainData(_devices)

    return devices && devices.map(({haveChildren, ...device}) =>
        ({...device, haveChildren: haveChildren.length > 0})
    )
}

// transaction function
Comment.transactionAddComment = (async (data, t) => {
    const userId = (data.ownerId) ? data.ownerId : null;
    data.type    = await getCommentType(userId, data.type);
  
    return Comment.create(data, {transaction: (t) ? t : null});
});

exports.Comment = Comment;
exports.Device  = Device;