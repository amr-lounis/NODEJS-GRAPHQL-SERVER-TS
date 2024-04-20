import { extendType } from 'nexus';
import { UserOut, userIn, userPhotoOut, userPhotoSetIn, userDeletIn } from './types';
import { db_user } from '../../data';

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('user_create', {
            type: UserOut,
            args: userIn,
            resolve(parent, args, context, info) {
                return db_user.create(args)
            },
        }),
            // 
            t.field('user_delete', {
                type: UserOut,
                args: userDeletIn,
                resolve(parent, args, context, info) {
                    return db_user.delete(args.id)
                },
            }),
            // 
            t.field('user_update', {
                type: UserOut,
                args: userIn,
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    else return db_user.update(args.id, args)
                },
            }),
            // 
            t.field('userPhoto_update', {
                type: userPhotoOut,
                args: userPhotoSetIn,
                resolve(parent, args, context, info) {
                    if (!args.id == context?.userThis?.id) throw new Error("this user only can do .")
                    return db_user.setPhoto(args.userId, args.photo)
                },
            });
        // 
        t.field('userRole_update', {
            type: userPhotoOut,
            args: userPhotoSetIn,
            resolve(parent, args, context, info) {
                return db_user.setPhoto(args.userId, args.photo)
            },
        });
        // 
    },
});