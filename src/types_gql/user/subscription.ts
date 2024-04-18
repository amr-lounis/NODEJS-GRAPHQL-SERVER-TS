import { extendType } from 'nexus';
import { userNotificationOut } from './types';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../../utils'

export const UserSubscription = extendType({
    type: 'Subscription',
    definition(t) {
        t.field('user_subscription', {
            type: userNotificationOut,
            args: {},
            subscribe: withFilter(
                () => pubsub.asyncIterator('user_notification_sender'),
                (payload, args, context, info) => {
                    try {
                        // return (context.decoded.id == payload.receiver_id); // true send data // false non send data
                        return true;
                    } catch (error) {
                        // return false;
                    }
                },
            ),
            async resolve(payload, args, context, info) {
                return new Promise((resolve, reject) => {
                    try {
                        // console.log("user_notification_receiver : payload:  =>  " + JSON.stringify(payload));
                        resolve(payload);
                    } catch (error) {
                        reject(new Error('---- ERROR : subscription .'));
                    }
                })
            },
        });
    },
});