import { booleanArg, extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_role } from '../data';

export const RoleQuery = extendType({
    type: 'Query',
    definition(t) {
        // **************************************************************************************************** 
        t.field('operations_get', {
            args: {},
            // ------------------------------
            type: list('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_role.operations_get()
            },
        });
        // **************************************************************************************************** 
        t.field('roles_get', {
            args: {},
            // ------------------------------
            type: list('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_role.roles_get()
            },
        });
        // **************************************************************************************************** 
        t.field('authorizations_get', {
            args: {
                roleId: nonNull(stringArg())
            },
            // ------------------------------
            type: list(objectType({
                name: 'authorizations_get_out',
                definition(t) {
                    t.nullable.string("operationId")
                    t.nullable.boolean("value")
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_role.authorizations_get(args.roleId)
            }
        });
    }
});

export const roleMutation = extendType({
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
            resolve(parent, args, context, info) {
                return db_role.role_create(args)
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
            resolve(parent, args, context, info) {
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
            resolve(parent, args, context, info) {
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
            resolve(parent, args, context, info) {
                return db_role.authorization_set(args.roleId, args.operationId, args.value)
            }
        });
        // **************************************************************************************************** 
    }
});
