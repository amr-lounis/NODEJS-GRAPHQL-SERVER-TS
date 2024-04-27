import { extendType, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db_user, userInType } from '../data';
import { pubsub } from '../utils';
import { withFilter } from 'graphql-subscriptions';

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

export const users_page_out = objectType({
    name: 'users_page_out',
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
            resolve(parent, args: userInType, context, info) {
                return db_user.user_authentication(args.id, args.password)
            },
        });
        // **************************************************************************************************** 
        t.field('user_authentication_renewal', {
            args: {},
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args: userInType, context, info) {
                return db_user.user_authentication_renewal(context?.jwt?.id, context?.jwt?.role)
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
            resolve(parent, args: userInType, context, info) {
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
            resolve(parent, args, context, info) {
                return db_user.userPhoto_get(args.userId)
            },
        });
        // **************************************************************************************************** 
        t.field('users_page_get', {
            args: {
                id: nullable(stringArg()),
                filter_id: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_create_min: nullable(stringArg()),
                filter_create_max: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
            },
            // ------------------------------
            type: users_page_out,
            description: "date format : 2000-01-01T00:00:00Z",
            // ------------------------------
            async resolve(parent, args: userInType, context, info) {
                return db_user.users_page_get(args)
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
                resolve(parent, args: userInType, context, info) {
                    return db_user.user_create(args)
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
                resolve(parent, args: userInType, context, info) {
                    return db_user.user_update(context?.jwt?.id, args)
                },
            }),
            // **************************************************************************************************** 
            t.field('userPhoto_update_self', {
                args: {
                    photo: nonNull(stringArg()),
                },
                // ------------------------------
                type: nonNull("String"),
                // ------------------------------
                resolve(parent, args: userInType, context, info) {
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
            resolve(parent, args: userInType, context, info) {
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
                resolve(parent, args: userInType, context, info) {
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