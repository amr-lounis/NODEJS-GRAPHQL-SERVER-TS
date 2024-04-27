import { booleanArg, extendType, nonNull, stringArg } from 'nexus';
import { db_role } from '../../data';

export type ArgsRolesM = {
    id: string,
    idNew: string,
    roleId: string,
    operationId: string,
    value: boolean,
}

export const RoleMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('role_create', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args: ArgsRolesM, context, info) {
                return db_role.role_create(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('role_update', {
            args: {
                id: nonNull(stringArg()),
                idNew: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args: ArgsRolesM, context, info) {
                return db_role.role_update(args.id, args.idNew)
            }
        });
        // **************************************************************************************************** 
        t.field('role_delete', {
            args: {
                id: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args: ArgsRolesM, context, info) {
                return db_role.role_delete(args.id)
            }
        });
        // **************************************************************************************************** 
        t.field('authorization_set', {
            args: {
                roleId: nonNull(stringArg()),
                operationId: nonNull(stringArg()),
                value: nonNull(booleanArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args: ArgsRolesM, context, info) {
                return db_role.authorization_set(args.roleId, args.operationId, args.value)
            }
        });
        // **************************************************************************************************** 
    }
});
