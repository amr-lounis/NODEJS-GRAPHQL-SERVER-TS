import { db } from "../../utils";

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
export const setting_set = async (key: string, value: string): Promise<boolean> => {
    await db.$transaction(async (t) => {
        const exist = await t.settings.findFirst({ select: { key: true }, where: { key: key } }) ? true : false
        if (!exist) await t.settings.create({ data: { key: key, value: value } })
        else await t.settings.update({ where: { key: key }, data: { key: key, value: value } })
    })
    return true
}
// **************************************************************************************************** 