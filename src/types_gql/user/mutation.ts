import { extendType, nonNull, nullable, objectType, stringArg } from 'nexus';
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
            type: objectType({
                name: 'user_create_out',
                definition(t) {
                    t.nullable.string("id")
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.create(args)
            },
        }),
            // **************************************************************************************************** 
            t.field('user_update', {
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
                type: objectType({
                    name: 'user_update_out',
                    definition(t) {
                        t.nullable.string("id")
                    },
                }),
                // ------------------------------
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    else return db_user.update(args.id, args)
                },
            }),
            // **************************************************************************************************** 
            t.field('user_delete', {
                args: {
                    id: nonNull(stringArg())
                },
                // ------------------------------
                type: objectType({
                    name: 'user_delete_out',
                    definition(t) {
                        t.nullable.string("id")
                    },
                }),
                // ------------------------------
                resolve(parent, args, context, info) {
                    return db_user.delete(args.id)
                },
            }),
            // **************************************************************************************************** 
            t.field('userPhoto_update', {
                args: {
                    userId: nonNull(stringArg()),
                    photo: nonNull(stringArg()),
                },
                // ------------------------------
                type: objectType({
                    name: 'userPhoto_update_out',
                    definition(t) {
                        t.nullable.string("userId")
                    },
                }),
                // ------------------------------
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    return db_user.setPhoto(args.userId, args.photo)
                },
            });
        // ****************************************************************************************************  
        t.field('userRole_update', {
            args: {
                id: nonNull(stringArg()),
                roleId: nullable(stringArg()),
            },
            // ------------------------------
            type: objectType({
                name: 'userRole_update_out',
                definition(t) {
                    t.nullable.string("id")
                    t.nullable.string("roleId")
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.update(args.id, { roleId: args.roleId })
            }
        });
        // **************************************************************************************************** 
    },
});