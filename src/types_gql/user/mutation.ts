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
            t.field('userThis_update', {
                type: UserOut,
                args: userIn,
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    else return db_user.updateUser(args.id, args)
                },
            }),
            // 
            t.field('userThis_photo_update', {
                type: userPhotoOut,
                args: userPhotoSetIn,
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    return db_user.setUserPhoto(args.userId, args.photo)
                },
            });
        // 
    },
});