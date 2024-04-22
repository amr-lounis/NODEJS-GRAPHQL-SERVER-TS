import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_role } from '../../data';

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

