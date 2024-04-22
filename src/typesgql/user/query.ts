import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_user } from '../../data';

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        // **************************************************************************************************** 
        t.field('user_signin', {
            args: {
                id: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.user_signin(args.id, args.password)
            },
        });
        // **************************************************************************************************** 
        t.field('userRole_get', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.userRole_get(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('userPhoto_get', {
            args: {
                userId: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.Photo_get(args.userId)
            },
        });
        // **************************************************************************************************** 
        t.field('user_get', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: objectType({
                name: 'user_get_out',
                definition(t) {
                    ["id", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
                        t.nonNull.string(x)
                    );
                    ["createdAt", "updatedAt"].map(x =>
                        t.nonNull.float(x)
                    );
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.user_get(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('users_get', {
            args: {},
            // ------------------------------
            type: list(objectType({
                name: 'users_get_out',
                definition(t) {
                    ["id", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
                        t.nullable.string(x)
                    );
                    ["createdAt", "updatedAt"].map(x =>
                        t.nullable.float(x)
                    );
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.users_get()
            },
        });
        // **************************************************************************************************** 
    }
});

