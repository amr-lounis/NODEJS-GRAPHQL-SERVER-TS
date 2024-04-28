import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { authorization_matrix } from '../../utils';
export type ArgsRolesQ = {
    roleId?: string,
}

export const RoleQuery = extendType({
    type: 'Query',
    definition(t) {
        // **************************************************************************************************** 
        t.field('operations_get', {
            args: {},
            // ------------------------------
            type: list('String'),
            // ------------------------------
            resolve(parent, args: void, context, info) {
                return authorization_matrix.operations_get()
            },
        });
        // **************************************************************************************************** 
        t.field('roles_get', {
            args: {},
            // ------------------------------
            type: list('String'),
            // ------------------------------
            resolve(parent, args: void, context, info) {
                return authorization_matrix.roles_get()
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
            resolve(parent, args: ArgsRolesQ, context, info) {
                return authorization_matrix.authorizations_get(args.roleId)
            }
        });
    }
});