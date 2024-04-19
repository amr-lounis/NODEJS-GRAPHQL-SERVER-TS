import { MyToken } from '../utils';
import { db } from './db';

class setting_controller {
    async gets() {
        return await db.settings.findMany({});
    }
    async get(key: string) {
        return await db.settings.findUnique({
            where: {
                key: key
            }
        })
    }
    async set(key: string, value: string) {
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
    async delete(key: string) {
        await db.settings.delete({
            where: {
                key: key
            }
        })
    }
}

export const db_setting = new setting_controller()