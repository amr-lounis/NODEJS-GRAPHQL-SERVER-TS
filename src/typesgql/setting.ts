import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_setting } from '../data';

export const settingQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('settings_get', {
            args: {},
            // ------------------------------
            type: list(objectType({
                name: 'settings_get_out',
                definition(t) {
                    t.nullable.string("key")
                    t.nullable.string("value")
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_setting.settings_get()
            },
        });
        // **************************************************************************************************** 
        t.field('setting_get', {
            args: {
                key: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_setting.setting_get(args.key)
            },
        });
    }
});

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
