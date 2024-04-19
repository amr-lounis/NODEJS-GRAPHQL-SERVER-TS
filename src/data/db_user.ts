import { MyToken } from '../utils';
import { db } from './db';

class user_controller {
    // ****************************************************************************************************
    async gets() {
        return await db.users.findMany({});
    }
    async get(id: string) {
        return await db.users.findUnique({
            where: {
                id: id
            }
        });
    }
    async create(data: any) {
        return await db.users.create({ data: data })
    }
    async update(id: string, data: any) {
        return await db.users.update({ where: { id: id }, data: data })
    }
    async delete(id: string) {
        return await db.users.delete({ where: { id: id } })
    }
    async signin(id: string, password: string) {
        let r = { Authorization: "" }
        try {
            var u = await db.users.findFirst({ where: { id: id, password: password } })
            r.Authorization = MyToken.Token_Create(u.id, u.first_name + u.last_name, u.roleId)
        } catch (error) {
            r.Authorization = ""
        }
        return r
    }
    // ****************************************************************************************************
    async getPhoto(userId: string) {
        const p = await db.u_photos.findFirst({ where: { userId: userId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async setPhoto(userId: string, photo: string) {
        if (photo.length > 524288) return new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        // 
        const exist = await db.u_photos.findFirst({ select: { userId: true }, where: { userId: userId } }) ? true : false
        if (!await exist) {
            const p = await db.u_photos.create({ data: { userId: userId, photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
        else {
            const p = await db.u_photos.update({ where: { userId: userId }, data: { photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
    }
    // ****************************************************************************************************
}

export const db_user = new user_controller()