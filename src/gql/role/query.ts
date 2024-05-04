import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db } from '../../utils';
// **************************************************************************************************** 
export const RoleQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('operations_get', {
            args: {},
            type: list('String'),
            resolve: (parent, args: void, context, info): Promise<string[]> => {
                return operations_get()
            },
        });
        // --------------------------------------------------
        t.field('roles_get', {
            args: {},
            type: list('String'),
            resolve: (parent, args: void, context, info): Promise<string[]> => {
                return roles_get()
            },
        });
        // --------------------------------------------------
        t.field('role_authorizations_get', {
            args: { roleId: nonNull(stringArg()) },
            type: list(objectType({
                name: 'authorizations_get_out',
                definition(t) {
                    t.nullable.string("operationId")
                    t.nullable.boolean("value")
                },
            })),
            resolve: (parent, args: { roleId?: string }, context, info) => {
                return authorizations_get(args.roleId)
            }
        });
    }
});
// **************************************************************************************************** 
export const operations_get = async (): Promise<string[]> => {
    const r = await db.u_operations.findMany({});
    return r.map((x) => x.id)
}
export const roles_get = async (): Promise<string[]> => {
    const r = await db.u_roles.findMany({ select: { id: true } });
    return r.map((x) => x.id)
}
export const authorizations_get = async (roleId: string) => {
    return await db.u_roles_operations.findMany({ where: { roleId: roleId } })
}
export const authorizations_all_get = async () => {
    return await db.u_roles_operations.findMany({})
}

// **************************************************************************************************** 