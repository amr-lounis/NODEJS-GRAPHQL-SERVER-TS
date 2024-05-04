import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db } from '../../utils';
// **************************************************************************************************** 
export const SettingQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('settings_get', {
            args: {},
            type: list(settings_get_out),
            resolve: async (parent, args, context, info): Promise<{ key?: string, value?: string }[]> => {
                return await db.settings.findMany({});
            },
        });
        // --------------------------------------------------
        t.field('setting_get', {
            args: { key: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve: async (parent, args: { key?: string }, context, info): Promise<string> => {
                const r = await db.settings.findUnique({ where: { key: args.key } })
                return r.value
            },
        });
    }
});
// **************************************************************************************************** 
export const settings_get = async () => {
    return await db.settings.findMany({});
}
export const setting_get = async (key: string): Promise<string> => {
    const r = await db.settings.findUnique({
        where: { key: key }
    })
    return r.value
}
const settings_get_out = objectType({
    name: 'settings_get_out',
    definition(t) {
        t.nullable.string("key")
        t.nullable.string("value")
    },
})
// **************************************************************************************************** 