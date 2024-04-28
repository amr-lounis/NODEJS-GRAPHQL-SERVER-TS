import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db } from '../../utils';

export type ArgsSettingQ = {
    key?: string,
}

export const SettingQuery = extendType({
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
            async resolve(parent, args: ArgsSettingQ, context, info) {
                return await db.settings.findMany({});
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
            async resolve(parent, args: ArgsSettingQ, context, info) {
                const r = await db.settings.findUnique({ where: { key: args.key } })
                return r.value
            },
        });
    }
});