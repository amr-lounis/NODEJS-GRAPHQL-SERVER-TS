import { booleanArg, extendType, nonNull, stringArg } from 'nexus';
import { authorization_matrix, db } from '../../utils';
// **************************************************************************************************** 
export const RoleMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('role_create', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return role_create(args.id)
            },
        });
        // --------------------------------------------------
        t.field('role_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return role_update(args.id, args.idNew)
            }
        });
        // --------------------------------------------------
        t.field('role_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return role_delete(args.id)
            }
        });
        // --------------------------------------------------
        t.field('role_authorization_set', {
            args: { roleId: nonNull(stringArg()), operationId: nonNull(stringArg()), value: nonNull(booleanArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { roleId: string, operationId: string, value: boolean }, context, info): Promise<boolean> => {
                return role_authorization_set(args.roleId, args.operationId, args.value)
            }
        });
    }
});
// **************************************************************************************************** 
export const operation_create = async (id: string): Promise<boolean> => {
    await db.u_operations.create({ data: { id: id } })
    return true
}
export const operation_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.u_operations.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const operation_delete = async (id: string): Promise<boolean> => {
    await db.u_operations.delete({ where: { id: id } })
    return true
}
// --------------------------------------------------
export const role_create = async (id: string): Promise<boolean> => {
    await db.u_roles.create({ data: { id: id } })
    return true
}
export const role_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.u_roles.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const role_delete = async (id: string): Promise<boolean> => {
    await db.u_roles.delete({ where: { id: id } })
    return true
}
// --------------------------------------------------
export const role_authorization_set = async (roleId: string, operationId: string, value: boolean): Promise<boolean> => {
    const exist = await db.u_roles_operations.findFirst({ where: { operationId: operationId, roleId: roleId } }) ? true : false
    if (!exist) {
        await db.u_roles_operations.create({
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    else {
        await db.u_roles_operations.updateMany({
            where: {
                operationId: operationId,
                roleId: roleId
            },
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    return true;
}
// **************************************************************************************************** 