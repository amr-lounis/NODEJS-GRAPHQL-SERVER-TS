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
            type: objectType({
                name: 'user_signin_out',
                definition(t) {
                    t.nonNull.string("Authorization")
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.signin(args.id, args.password)
            },
        });
        // **************************************************************************************************** 
        t.field('user_get', {
            args: {
                userId: nonNull(stringArg()),
            },
            // ------------------------------
            type: objectType({
                name: 'user_get_out',
                definition(t) {
                    ["id", "roleId", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
                        t.nullable.string(x)
                    );
                    ["createdAt", "updatedAt"].map(x =>
                        t.nullable.float(x)
                    );
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.get(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('users_get', {
            args: {},
            // ------------------------------
            type: list(objectType({
                name: 'users_get_out',
                definition(t) {
                    ["id", "roleId", "description", "address", "first_name", "last_name", "phone", "fax", "email"].map(x =>
                        t.nullable.string(x)
                    );
                    ["createdAt", "updatedAt"].map(x =>
                        t.nullable.float(x)
                    );
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.gets()
            },
        });
        // **************************************************************************************************** 
        t.field('userPhoto_get', {
            args: {
                userId: nonNull(stringArg()),
            },
            // ------------------------------
            type: objectType({
                name: 'userPhoto_get_out',
                definition(t) {
                    ["userId", "photo"].map(x =>
                        t.nullable.string(x)
                    );
                    ["createdAt", "updatedAt"].map(x =>
                        t.nullable.float(x)
                    );
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_user.getPhoto(args.userId)
            },
        });
        // **************************************************************************************************** 
    }
});

