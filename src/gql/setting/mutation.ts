import { extendType, nonNull, stringArg } from 'nexus';
import { db } from '../../utils';

export type ArgsSettingM = {
    key?: string,
    value?: string,
}

export const SettingMutation = extendType({
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
            async resolve(parent, args, context, info) {
                const exist = await db.settings.findFirst({ select: { key: true }, where: { key: args.key } }) ? true : false
                if (!exist) await db.settings.create({ data: { key: args.key, value: args.value } })
                else await db.settings.update({ where: { key: args.key }, data: { key: args.key, value: args.value } })
                return "ok"
            },
        });
    }
});
