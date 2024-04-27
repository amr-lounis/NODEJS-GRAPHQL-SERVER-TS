import { db } from './db';

class setting_controller {
    // **************************************************************************************************** Q
    async settings_get() {
        return await db.settings.findMany({});
    }
    async setting_get(key: string): Promise<string> {
        const r = await db.settings.findUnique({
            where: {
                key: key
            }
        })
        return r.value
    }
    // **************************************************************************************************** M
    async setting_set(key: string, value: string): Promise<string> {
        const exist = await db.settings.findFirst({ select: { key: true }, where: { key: key } }) ? true : false
        if (!exist) {
            await db.settings.create({
                data: {
                    key: key,
                    value: value
                }
            })
            return "ok"
        }
        else {
            await db.settings.update({
                where: {
                    key: key
                },
                data: {
                    key: key,
                    value: value
                }
            })
            return "ok"
        }
    }
    async setting_delete(key: string): Promise<string> {
        await db.settings.delete({
            where: {
                key: key
            }
        })
        return "ok"
    }
}

export const db_setting = new setting_controller()