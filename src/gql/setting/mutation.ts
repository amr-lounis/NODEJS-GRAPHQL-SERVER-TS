import { extendType, nonNull, stringArg } from 'nexus';
import { setting_set } from './controller';
// **************************************************************************************************** 
export const SettingMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('setting_set', {
            args: { key: nonNull(stringArg()), value: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { key?: string, value?: string }, context, info): Promise<boolean> => {
                return setting_set(args.key, args.value)
            },
        });
    }
});
