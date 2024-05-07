import { extendType, nonNull, nullable, stringArg } from 'nexus';
import { db, pubsub, ContextType } from '../../utils';
import { ArgsUserM, user_create, user_delete, user_update } from './controller';
// **************************************************************************************************** 
export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('user_notification_send', {
            args: {
                receiverId: nonNull(stringArg()),
                title: nonNull(stringArg()),
                content: nonNull(stringArg()),
            },
            type: nullable("Boolean"),
            resolve: (parent, args: { senderId: string, receiverId: string, title: string, content: string }, context, info): boolean => {
                const payload = { senderId: context.jwt.id, receiverId: args.receiverId, title: args.title, content: args.content }
                pubsub.publish("user_notification_sender", payload);
                return true
            },
        });
        // --------------------------------------------------
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
                photo: stringArg(),
            },
            type: nonNull("Boolean"),
            resolve: (parent, args: ArgsUserM, context, info): Promise<boolean> => {
                return user_create(args)
            }
        });
        // --------------------------------------------------
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
                photo: stringArg(),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsUserM, context: ContextType, info): Promise<boolean> => {
                return user_update(context?.jwt?.id, args)
            }
        });
        // --------------------------------------------------
        t.field('user_id_update', {
            args: {
                id: nonNull(stringArg()),
                idNew: nonNull(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return user_update(args.id, { id: args.idNew })
            },
        });
        // --------------------------------------------------
        t.field('user_role_update', {
            args: {
                userId: nonNull(stringArg()),
                roleId: nullable(stringArg())
            },
            type: nullable("Boolean"),
            resolve: (parent, args: { userId: string, roleId: string }, context, info): Promise<boolean> => {
                return user_update(args.userId, { roleId: args.roleId })
            }
        });
        // --------------------------------------------------
        t.field('user_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull("Boolean"),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return user_delete(args.id)
            },
        });
    },
});
// **************************************************************************************************** 
