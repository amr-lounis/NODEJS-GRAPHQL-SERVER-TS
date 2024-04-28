import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db } from '../../utils';

export const SettingQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('settings_get', {
            args: {},
            type: list(settings_get_out),
            async resolve(parent, args: ArgsSettingQ, context, info) {
                return await db.settings.findMany({});
            },
        });
        // **************************************************************************************************** 
        t.field('setting_get', {
            args: { key: nonNull(stringArg()) },
            type: nonNull('String'),
            async resolve(parent, args: ArgsSettingQ, context, info) {
                const r = await db.settings.findUnique({ where: { key: args.key } })
                return r.value
            },
        });
    }
});

export const settings_get = async () => {
    return await db.settings.findMany({});
}
export const setting_get = async (key: string): Promise<string> => {
    const r = await db.settings.findUnique({
        where: { key: key }
    })
    return r.value
}

export type ArgsSettingQ = {
    key?: string,
}

const settings_get_out = objectType({
    name: 'settings_get_out',
    definition(t) {
        t.nullable.string("key")
        t.nullable.string("value")
    },
})