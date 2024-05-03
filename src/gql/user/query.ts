import { extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, MyToken, toPage, ContextType, myLog } from '../../utils';
// **************************************************************************************************** 
export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('user_authentication', {
            args: { id: nonNull(stringArg()), password: nonNull(stringArg()) },
            type: nonNull("String"),
            resolve(parent, args: ArgsUserQ, context, info) {
                return user_authentication(args.id, args.password)
            },
        });
        // --------------------------------------------------
        t.field('user_authentication_renewal', {
            args: {},
            type: nonNull("String"),
            resolve(parent, args: void, context: ContextType, info) {
                return user_authentication_renewal(context?.jwt?.id, context?.jwt?.role)
            },
        });
        // -------------------------------------------------- 
        t.field('user_authentication_info', {
            args: {},
            type: nonNull("String"),
            resolve(parent, args: ArgsUserQ, context: ContextType, info) {
                const id = context.jwt.id
                const role = context.jwt.role
                const iat = new Date(context.jwt.iat * 1000).toISOString()
                const exp = new Date(context.jwt.exp * 1000).toISOString()
                return `{id:${id},role:${role},iat:${iat},exp:${exp}}`
            },
        });
        // --------------------------------------------------
        t.field('user_role_get', {
            args: { id: nonNull(stringArg()), },
            type: nonNull("String"),
            resolve(parent, args: ArgsUserQ, context, info) {
                return user_role_get(args.id)
            },
        });
        // --------------------------------------------------
        t.field('user_photo_get', {
            args: { userId: nonNull(stringArg()), },
            type: nonNull("String"),
            resolve(parent, args: ArgsUserQ, context, info) {
                return user_photo_get(args.userId)
            },
        });
        // --------------------------------------------------
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
            type: users_out,
            description: "date format : 2000-01-01T00:00:00Z",
            resolve(parent, args: ArgsUserQ, context, info) {
                return users_get(args)
            },
        });
    }
});
// **************************************************************************************************** 
export const user_authentication = async (id: string, password: string): Promise<String> => {
    try {
        var u = await db.users.findFirst({ where: { id: id, password: password } })
        return MyToken.Token_Create(u.id, u.roleId)
    } catch (error) {
        return ""
    }
}
export const user_authentication_renewal = async (id: string, roleId: string): Promise<String> => {
    try {
        return MyToken.Token_Create(id, roleId)
    } catch (error) {
        return ""
    }
}
export const user_role_get = async (id: string): Promise<String> => {
    const r = await db.users.findUnique({ where: { id: id } });
    return r?.roleId
}
export const user_photo_get = async (id: string): Promise<String> => {
    const p = await db.u_photos.findUnique({ where: { userId: id } },);
    return p?.photo?.toString() ?? ""
}

export const users_get = async (args: ArgsUserQ) => {
    args.filter_id = args.filter_id ?? ""
    const itemsCountAll = (await db.users.aggregate({
        _count: { id: true }, where: { // -------------------------------------------------- where for 1
            OR: [{ id: args.id }, { id: { contains: args.filter_id } },],
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await db.users.findMany({
        orderBy: { createdAt: 'desc' }, where: {  // -------------------------------------------------- where for 2
            OR: [{ id: args.id }, { id: { contains: args.filter_id } },],
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }, skip: p.itemsSkip, take: p.itemsTake
    })

    return {
        allItemsCount: itemsCountAll,
        allPagesCount: p.allPagesCount,
        itemsSkip: p.itemsSkip,
        itemsTake: p.itemsTake,
        pageNumber: p.pageNumber,
        itemsCount: items.length,
        items: items
    }
}
// **************************************************************************************************** 
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
// **************************************************************************************************** 