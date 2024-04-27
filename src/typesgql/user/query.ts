import { extendType, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, db_user } from './controller';
import { toPage } from '../../utils';

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
