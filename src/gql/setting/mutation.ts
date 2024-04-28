import { extendType, nonNull, stringArg } from 'nexus';
import { db } from '../../utils';

export const SettingMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('setting_set', {
            args: { key: nonNull(stringArg()), value: nonNull(stringArg()), },
            type: nonNull('String'),
            resolve(parent, args: ArgsSettingM, context, info) {
                return setting_set(args.key, args.value)
            },
        });
    }
});

export const setting_set = async (key: string, value: string): Promise<string> => {
    await db.$transaction(async (t) => {
        const exist = await t.settings.findFirst({ select: { key: true }, where: { key: key } }) ? true : false
        if (!exist) await t.settings.create({ data: { key: key, value: value } })
        else await t.settings.update({ where: { key: key }, data: { key: key, value: value } })
    })
    return "ok"
}

export type ArgsSettingM = {
    key?: string,
    value?: string,
}