import { extendType, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, db_user } from '../data';
import { pubsub, toPage } from '../utils';
import { withFilter } from 'graphql-subscriptions';

export type ArgsUserQ = {
    id?: string,
    userId?: string,
    password?: string,
    filter_id?: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    itemsTake?: number,
    itemsSkip?: number,
    pageNumber?: number,
}

export type ArgsUserM = {
    id?: string,
    roleId?: string,
    password?: string,
    description?: string,
    address?: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    fax?: string,
    email?: string,
    photo?: string,
}

export type payloadType = {
    senderId: string,
    receiverId: string,
    title: string,
    content: string
}

export const user_get_out = objectType({
    name: 'user_get_out',
    definition(t) {
        ["id", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
            t.nullable.string(x)
        );
        ["createdAt", "updatedAt"].map(x =>
            t.nullable.float(x)
        );
    },
});

export const users_out = objectType({
    name: 'users_out',
    definition(t) {
        t.nullable.int('allItemsCount')
        t.nullable.int('allPagesCount')
        t.nullable.int('pageNumber')
        t.nullable.int('itemsTake')
        t.nullable.int('itemsSkip')
        t.nullable.int('itemsCount')
        t.nullable.list.field('items', { type: 'user_get_out' })
    },
});

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        // **************************************************************************************************** 
        t.field('user_authentication', {
            args: {
                id: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserQ, context, info) {
                return db_user.user_authentication(args.id, args.password)
            },
        });
        // **************************************************************************************************** 
        t.field('user_authentication_renewal', {
            args: {},
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: void, context, info) {
                return db_user.user_authentication_renewal(context?.jwt?.id, context?.jwt?.role)
            },
        });
        // **************************************************************************************************** 
        t.field('user_authentication_info', {
            args: {},
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserQ, context, info) {
                const id = context.jwt.id
                const role = context.jwt.role
                const iat = new Date(context.jwt.iat * 1000).toISOString()
                const exp = new Date(context.jwt.exp * 1000).toISOString()
                return `{id:${id},role:${role},iat:${iat},exp:${exp}}`
            },
        });
        // **************************************************************************************************** 
        t.field('userRole_get', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserQ, context, info) {
                return db_user.userRole_get(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('userPhoto_get', {
            args: {
                userId: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserQ, context, info) {
                return db_user.userPhoto_get(args.userId)
            },
        });
        // **************************************************************************************************** 
        t.field('users_get', {
            args: {
                id: nullable(stringArg()),
                filter_id: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
            },
            // ------------------------------
            type: users_out,
            description: "date format : 2000-01-01T00:00:00Z",
            // ------------------------------
            async resolve(parent, args: ArgsUserQ, context, info) {
                args.filter_id = args.filter_id ?? ""
                const where = {
                    OR: [{ id: args.id }, { id: { contains: args.filter_id } },],
                    createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
                    description: { contains: args.filter_description },
                };

                const itemsCountAll = (await db.users.aggregate({ _count: { id: true }, where: where }))._count.id
                const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
                const items = await db.users.findMany({ orderBy: { createdAt: 'desc' }, where, skip: p.itemsSkip, take: p.itemsTake })

                return {
                    allItemsCount: itemsCountAll,
                    allPagesCount: p.allPagesCount,
                    itemsSkip: p.itemsSkip,
                    itemsTake: p.itemsTake,
                    pageNumber: p.pageNumber,
                    itemsCount: items.length,
                    items: items
                }
            },
        });
        // **************************************************************************************************** 
    }
});

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('user_notification_send', {
            args: {
                receiverId: nonNull(stringArg()),
                title: nonNull(stringArg()),
                content: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: payloadType, context, info) {
                const payload: payloadType = { senderId: context.jwt.id, receiverId: args.receiverId, title: args.title, content: args.content }
                pubsub.publish("user_notification_sender", payload);
                return "ok"
            },
        }),
            // **************************************************************************************************** 
            t.field('user_create', {
                args: {
                    id: nonNull(stringArg()),
                    password: stringArg(),
                    description: stringArg(),
                    address: stringArg(),
                    first_name: stringArg(),
                    last_name: stringArg(),
                    phone: stringArg(),
                    fax: stringArg(),
                    email: stringArg(),
                },
                // ------------------------------
                type: nonNull("String"),
                // ------------------------------
                async resolve(parent, args: ArgsUserM, context, info) {
                    await db.users.create({
                        data: {
                            id: args.id,
                            password: args.password,
                            description: args.description,
                            address: args.address,
                            first_name: args.first_name,
                            last_name: args.last_name,
                            phone: args.phone,
                            fax: args.fax,
                            email: args.email,
                        }
                    })
                    return "ok"
                },
            }),
            // **************************************************************************************************** 
            t.field('user_update_self', {
                args: {
                    password: stringArg(),
                    description: stringArg(),
                    address: stringArg(),
                    first_name: stringArg(),
                    last_name: stringArg(),
                    phone: stringArg(),
                    fax: stringArg(),
                    email: stringArg(),
                },
                // ------------------------------
                type: nonNull('String'),
                // ------------------------------
                async resolve(parent, args: ArgsUserM, context, info) {
                    await db.users.update({
                        where: { id: context?.jwt?.id },
                        data: {
                            password: args.password,
                            description: args.description,
                            address: args.address,
                            first_name: args.first_name,
                            last_name: args.last_name,
                            phone: args.phone,
                            fax: args.fax,
                            email: args.email,
                        }
                    })
                    return "ok"
                }
            })
        // **************************************************************************************************** 
        t.field('userPhoto_update_self', {
            args: {
                photo: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserM, context, info) {
                return db_user.userPhoto_set(context?.jwt?.id, args.photo)
            },
        });
        // ****************************************************************************************************
        t.field('user_delete', {
            args: {
                id: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: ArgsUserM, context, info) {
                return db_user.user_delete(args.id)
            },
        }),
            // ****************************************************************************************************  
            t.field('userRole_update', {
                args: {
                    id: nonNull(stringArg()),
                    roleId: nullable(stringArg()),
                },
                // ------------------------------
                type: nonNull("String"),
                // ------------------------------
                resolve(parent, args: ArgsUserM, context, info) {
                    return db_user.userRole_update(args.id, args.roleId)
                }
            });
        // **************************************************************************************************** 
    },
});

export const UserSubscription = extendType({
    type: 'Subscription',
    definition(t) {
        t.field('user_subscription', {
            type: objectType({
                name: 'userNotificationOut',
                definition(t) {
                    t.nullable.string('senderId');
                    t.nullable.string('receiverId');
                    t.nullable.string('title');
                    t.nullable.string('content');
                },
            }),
            args: {},
            subscribe: withFilter(
                () => pubsub.asyncIterator('user_notification_sender'),
                (payload, args, context, info) => {
                    if (context?.jwt?.id == payload?.receiverId) return true
                },
            ),
            async resolve(payload, args, context, info) {
                return new Promise((resolve, reject) => {
                    try {
                        // myLog("user_notification_receiver : payload:  =>  " + JSON.stringify(payload));
                        resolve(payload);
                    } catch (error) {
                        reject(new Error('---- ERROR : subscription .'));
                    }
                })
            },
        });
    },
});