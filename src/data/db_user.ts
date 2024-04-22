import { MyToken } from '../utils';
import { db } from './db';

class user_controller {
    // ****************************************************************************************************

    async users_get() {
        return await db.users.findMany({});
    }
    async user_get(id: string) {
        return await db.users.findUnique({ where: { id: id } });
    }
    async user_signin(id: string, password: string): Promise<String> {//Authorization
        try {
            var u = await db.users.findFirst({ where: { id: id, password: password } })
            return MyToken.Token_Create(u.id, u.roleId)
        } catch (error) {
            return ""
        }
    }
    async user_create(data: any): Promise<String> {
        await db.users.create({ data: data })
        return "ok"
    }
    async user_update(id: string, data: any): Promise<String> {
        await db.users.update({ where: { id: id }, data: data })
        return "ok"
    }
    async user_delete(id: string): Promise<String> {
        await db.users.delete({ where: { id: id } })
        return "ok"
    }

    async userRole_get(id: string): Promise<String> {
        const r = await db.users.findUnique({ where: { id: id } });
        return r.roleId
    }
    async userRole_update(id: string, roleId: string): Promise<String> {
        const r = await db.users.update({
            where: {
                id: id
            },
            data: {
                roleId: roleId
            }
        })
        return "ok"
    }
    // ****************************************************************************************************
    async Photo_get(userId: string): Promise<String> {
        const p = await db.u_photos.findFirst({ where: { userId: userId } },);
        return p?.photo?.toString() ?? ""
    }
    async Photo_set(userId: string, photo: string): Promise<String | Error> {
        if (photo.length > 524288) return new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        // 
        const exist = await db.u_photos.findFirst({ select: { userId: true }, where: { userId: userId } }) ? true : false
        if (!await exist) {
            await db.u_photos.create({ data: { userId: userId, photo: photpBytes } },);
            return "ok"
        }
        else {
            await db.u_photos.update({ where: { userId: userId }, data: { photo: photpBytes } },);
            return "ok"
        }
    }
    // ****************************************************************************************************
}

export const db_user = new user_controller()