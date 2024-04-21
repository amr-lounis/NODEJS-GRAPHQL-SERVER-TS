import { extendType, objectType } from 'nexus';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../../utils'

export const UserSubscription = extendType({
    type: 'Subscription',
    definition(t) {
        t.field('user_subscription', {
            type: objectType({
                name: 'userNotificationOut',
                definition(t) {
                    t.nullable.int('sender_id');
                    t.nullable.int('receiver_id');
                    t.nullable.string('title');
                    t.nullable.string('content');
                },
            }),
            args: {},
            subscribe: withFilter(
                () => pubsub.asyncIterator('user_notification_sender'),
                (payload, args, context, info) => {
                    if (context?.userThis?.id == payload?.receiver_id) return true
                },
            ),
            async resolve(payload, args, context, info) {
                return new Promise((resolve, reject) => {
                    try {
                        console.log("user_notification_receiver : payload:  =>  " + JSON.stringify(payload));
                        resolve(payload);
                    } catch (error) {
                        reject(new Error('---- ERROR : subscription .'));
                    }
                })
            },
        });
    },
});