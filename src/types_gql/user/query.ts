import { extendType, list } from 'nexus';
import { UserOut, userPhotoOut, userPhotoGetIn, userAuthenticationOut, userAuthenticationIn } from './types';
import { db_user } from '../../data';

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('user_signin', {
            type: userAuthenticationOut,
            args: userAuthenticationIn,
            resolve(parent, args, context, info) {
                return db_user.signin(args.idName, args.password)
            },
        });
        t.field('users_get', {
            type: list(UserOut),
            args: {},
            resolve(parent, args, context, info) {
                return db_user.gets()
            },
        });
        t.field('userPhoto_get', {
            type: userPhotoOut,
            args: userPhotoGetIn,
            resolve(parent, args, context, info) {
                return db_user.getPhoto(args.idName)
            },
        });

    }
});

