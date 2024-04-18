import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { UserOut, userIn, userAuthenticationOut, userPhotoOut, userPhotoSetIn, userAuthenticationIn } from './types';
import { db_user } from '../../data';

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('user_add', {
            type: UserOut,
            args: userIn,
            resolve(parent, args, context, info) {
                return db_user.createUser(args)
            },
        }),
            // 
            t.field('user_update', {
                type: UserOut,
                args: userIn,
                resolve(parent, args, context, info) {
                    return db_user.updateUser(args.id, args)
                },
            }),
            // 
            t.field('user_update_my', {
                type: UserOut,
                args: userIn,
                resolve(parent, args, context, info) {
                    if (args.id == context?.userThis?.id) return db_user.updateUser(args.id, args)
                    else throw new Error("owner only can do update")
                },
            }),
            // 
            t.field('user_photo_set', {
                type: userPhotoOut,
                args: userPhotoSetIn,
                resolve(parent, args, context, info) {
                    return db_user.setUserPhoto(args.userId, args.photo)
                },
            });
        // 
    },
});