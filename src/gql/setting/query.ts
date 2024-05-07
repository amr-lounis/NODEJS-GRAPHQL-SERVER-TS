import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { setting_get, settings_get } from './controller';
// **************************************************************************************************** 
export const SettingQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('settings_get', {
            args: {},
            type: list(settings_get_out),
            resolve: (parent, args, context, info): Promise<{ key?: string, value?: string }[]> => {
                return settings_get()
            },
        });
        // --------------------------------------------------
        t.field('setting_get', {
            args: { key: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve: async (parent, args: { key?: string }, context, info): Promise<string> => {
                return setting_get(args.key)
            },
        });
    }
});

const settings_get_out = objectType({
    name: 'settings_get_out',
    definition(t) {
        t.nullable.string("key")
        t.nullable.string("value")
    },
})