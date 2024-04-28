import { booleanArg, extendType, nonNull, stringArg } from 'nexus';
import { authorization_matrix } from '../../utils';

export const RoleMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('role_create', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('String'),
            resolve(parent, args: ArgsRolesM, context, info) {
                return authorization_matrix.role_create(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('role_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('String'),
            resolve(parent, args: ArgsRolesM, context, info) {
                return authorization_matrix.role_update(args.id, args.idNew)
            }
        });
        // **************************************************************************************************** 
        t.field('role_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: ArgsRolesM, context, info) {
                return authorization_matrix.role_delete(args.id)
            }
        });
        // **************************************************************************************************** 
        t.field('authorization_set', {
            args: { roleId: nonNull(stringArg()), operationId: nonNull(stringArg()), value: nonNull(booleanArg()) },
            type: nonNull('String'),
            resolve(parent, args: ArgsRolesM, context, info) {
                return authorization_matrix.authorization_set(args.roleId, args.operationId, args.value)
            }
        });
        // **************************************************************************************************** 
    }
});

export type ArgsRolesM = {
    id: string,
    idNew: string,
    roleId: string,
    operationId: string,
    value: boolean,
}
