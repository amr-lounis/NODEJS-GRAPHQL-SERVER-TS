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
                    t.nullable.string('senderId');
                    t.nullable.string('receiverId');
                    t.nullable.string('title');
                    t.nullable.string('content');
                },
            }),
            args: {},
            subscribe: withFilter(
                () => pubsub.asyncIterator('user_notification_sender'),
                (payload, args, context, info) => {
                    if (context?.userThis?.id == payload?.receiverId) return true
                },
            ),
            async resolve(payload, args, context, info) {
                return new Promise((resolve, reject) => {
                    try {
                        // myLog("user_notification_receiver : payload:  =>  " + JSON.stringify(payload));
                        resolve(payload);
                    } catch (error) {
                        reject(new Error('---- ERROR : subscription .'));
                    }
                })
            },
        });
    },
});