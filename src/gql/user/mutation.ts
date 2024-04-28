import { extendType, nonNull, nullable, stringArg } from 'nexus';
import { db, pubsub, ContextType } from '../../utils';

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
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
                type: nonNull("String"),
                resolve(parent, args: ArgsUserM, context, info) {
                    return user_create(args)
                }
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
                type: nonNull('String'),
                resolve(parent, args: ArgsUserM, context: ContextType, info) {
                    return user_update(context?.jwt?.id, args)
                }
            })
        // **************************************************************************************************** 
        t.field('userPhoto_update_self', {
            args: { photo: nonNull(stringArg()), },
            type: nonNull("String"),
            resolve(parent, args: ArgsUserM, context: ContextType, info) {
                return userPhoto_set(context?.jwt?.id, args.photo)
            },
        });
        // ****************************************************************************************************
        t.field('user_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull("String"),
            resolve(parent, args: ArgsUserM, context, info) {
                return user_delete(args.id)
            },
        }),
            // ****************************************************************************************************  
            t.field('userRole_update', {
                args: { id: nonNull(stringArg()), roleId: nullable(stringArg()) },
                type: nonNull("String"),
                resolve(parent, args: ArgsUserM, context, info) {
                    return userRole_update(args.id, args.roleId)
                }
            });
        // **************************************************************************************************** 
    },
});

export const user_delete = async (id: string): Promise<String> => {
    await db.users.delete({ where: { id: id } })
    return "ok"
}
export const userRole_update = async (id: string, roleId: string): Promise<String> => {
    await db.users.update({ where: { id: id }, data: { roleId: roleId } })
    return "ok"
}
export const userPhoto_set = async (userId: string, photo: string): Promise<String> => {
    if (photo.length > 524288) throw new Error("The size is greater than the maximum value");
    const photpBytes = Buffer.from(photo ?? "", 'utf8')
    // 
    const exist = await db.u_photos.findFirst({ select: { userId: true }, where: { userId: userId } }) ? true : false
    if (!await exist) await db.u_photos.create({ data: { userId: userId, photo: photpBytes } },);
    else await db.u_photos.update({ where: { userId: userId }, data: { photo: photpBytes } },);
    return "ok"
}
export const user_update = async (id: string, args: ArgsUserM): Promise<string> => {
    await db.users.update({
        where: { id: id },
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
export const user_create = async (args: ArgsUserM) => {
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
}
export type ArgsUserM = {
    id?: string,
    userId?: string,
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