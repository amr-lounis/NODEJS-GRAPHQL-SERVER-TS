import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_setting } from '../../data/db_setting';

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

