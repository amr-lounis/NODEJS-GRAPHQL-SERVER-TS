import { booleanArg, extendType, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db_setting } from '../../data/db_setting';

export const settingMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('setting_set', {
            args: {
                key: nonNull(stringArg()),
                value: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_setting.setting_set(args.key, args.value)
            },
        });
    }
});