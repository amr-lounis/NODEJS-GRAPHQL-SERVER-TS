import { extendType, nonNull, nullable, stringArg } from 'nexus';
import { db, pubsub, ContextType } from '../../utils';
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
            args: { id: nonNull(stringArg()), roleId: nullable(stringArg()) },
            type: nullable("Boolean"),
            resolve: (parent, args: ArgsUserM, context, info): Promise<boolean> => {
                return user_update(args.id, { roleId: args.roleId })
            }
        });
        // --------------------------------------------------
        t.field('user_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull("Boolean"),
            resolve: (parent, args: ArgsUserM, context, info): Promise<boolean> => {
                return user_delete(args.id)
            },
        });
    },
});
// **************************************************************************************************** 
export const user_create = async (args: ArgsUserM): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : id is required');
    await db.$transaction(async (t) => {
        await t.users.create({
            data: {
                id: args.id,
                password: args.password,
                description: args.description,
                roleId: args.roleId,
                address: args.address,
                first_name: args.first_name,
                last_name: args.last_name,
                phone: args.phone,
                fax: args.fax,
                email: args.email,
            }
        });
        await t.u_photos.create({
            data: { userId: args.id, photo: Buffer.from("", 'utf8') }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.u_photos.update({ where: { userId: args.id }, data: { photo: photpBytes } });
        }
    });
    return true;
}
export const user_update = async (id: string, args: ArgsUserM): Promise<boolean> => {
    await db.$transaction(async (t) => {
        if (args.id == undefined) throw new Error('error : id is required');
        const exist_u = await t.users.findFirst({ select: { id: true }, where: { id: id } }) ? true : false;
        if (!exist_u) throw new Error(`error : user id : ${id} is not exist`);
        await t.users.update({
            where: { id: id },
            data: {
                id: args.id,
                password: args.password,
                description: args.description,
                roleId: args.roleId,
                address: args.address,
                first_name: args.first_name,
                last_name: args.last_name,
                phone: args.phone,
                fax: args.fax,
                email: args.email,
            }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.u_photos.update({ where: { userId: args.id }, data: { photo: photpBytes } });
        }
    }
    );
    return true;
}
export const user_delete = async (id: string): Promise<boolean> => {
    await db.users.delete({ where: { id: id } })
    return true;
}
// **************************************************************************************************** 
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