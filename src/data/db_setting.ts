import { MyToken } from '../utils';
import { db } from './db';

class setting_controller {
    // ****************************************************************************************************
    async getSettings() {
        return await db.settings.findMany({});
    }
    async getSetting(key: string) {
        return await db.settings.findUnique({
            where: {
                key: key
            }
        })
    }
    async setSetting(key: string, value: string) {
        const exist = await db.settings.findFirst({ select: { key: true }, where: { key: key } }) ? true : false
        if (!exist) {
            await db.settings.create({
                data: {
                    key: key,
                    value: value
                }
            })
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
        }
    }
}

export const db_setting = new setting_controller()