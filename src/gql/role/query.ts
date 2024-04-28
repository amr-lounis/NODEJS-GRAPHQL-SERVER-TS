import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { authorization_matrix } from '../../utils';

export const RoleQuery = extendType({
    type: 'Query',
    definition(t) {
        // **************************************************************************************************** 
        t.field('operations_get', {
            args: {},
            type: list('String'),
            resolve(parent, args: void, context, info) {
                return authorization_matrix.operations_get()
            },
        });
        // **************************************************************************************************** 
        t.field('roles_get', {
            args: {},
            type: list('String'),
            resolve(parent, args: void, context, info) {
                return authorization_matrix.roles_get()
            },
        });
        // **************************************************************************************************** 
        t.field('authorizations_get', {
            args: { roleId: nonNull(stringArg()) },
            type: list(authorizations_get_out),
            resolve(parent, args: ArgsRolesQ, context, info) {
                return authorization_matrix.authorizations_get(args.roleId)
            }
        });
    }
});

export type ArgsRolesQ = {
    roleId?: string,
}

const authorizations_get_out = objectType({
    name: 'authorizations_get_out',
    definition(t) {
        t.nullable.string("operationId")
        t.nullable.boolean("value")
    },
})