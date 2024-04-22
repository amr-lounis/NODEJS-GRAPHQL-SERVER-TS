import { extendType, nonNull, nullable, objectType, scalarType, stringArg } from 'nexus';
import { db_user } from '../../data';

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('user_create', {
            args: {
                id: nonNull(stringArg()),
                password: stringArg(),
                // roleId: stringArg(),
                description: stringArg(),
                address: stringArg(),
                first_name: stringArg(),
                last_name: stringArg(),
                phone: stringArg(),
                fax: stringArg(),
                email: stringArg(),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.user_create(args)
            },
        }),
            // **************************************************************************************************** 
            t.field('user_update', {
                args: {
                    id: nonNull(stringArg()),
                    password: stringArg(),
                    description: stringArg(),
                    address: stringArg(),
                    first_name: stringArg(),
                    last_name: stringArg(),
                    phone: stringArg(),
                    fax: stringArg(),
                    email: stringArg(),
                },
                // ------------------------------
                type: nonNull('String'),
                // ------------------------------
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    else return db_user.user_update(args.id, args)
                },
            }),
            // **************************************************************************************************** 
            t.field('user_delete', {
                args: {
                    id: nonNull(stringArg())
                },
                // ------------------------------
                type: nonNull("String"),
                // ------------------------------
                resolve(parent, args, context, info) {
                    return db_user.user_delete(args.id)
                },
            }),
            // **************************************************************************************************** 
            t.field('userPhoto_update', {
                args: {
                    userId: nonNull(stringArg()),
                    photo: nonNull(stringArg()),
                },
                // ------------------------------
                type: nonNull("String"),
                // ------------------------------
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    return db_user.Photo_set(args.userId, args.photo)
                },
            });
        // ****************************************************************************************************  
        t.field('userRole_update', {
            args: {
                id: nonNull(stringArg()),
                roleId: nullable(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.userRole_update(args.id, args.roleId)
            }
        });
        // **************************************************************************************************** 
    },
});