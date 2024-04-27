import { extendType, nonNull, nullable, stringArg } from 'nexus';
import { db, db_user } from './controller';
import { pubsub } from '../../utils';

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
            resolve(parent, args: { senderId: string, receiverId: string, title: string, content: string }, context, info) {
                const payload = { senderId: context.jwt.id, receiverId: args.receiverId, title: args.title, content: args.content }
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
