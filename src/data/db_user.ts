import { MyToken } from '../utils';
import { db } from './db';

class user_controller {
    // ****************************************************************************************************
    async createUser(data: any) {
        return await db.users.create({ data: data })
    }
    async getUsers() {
        return await db.users.findMany({});
    }
    async updateUser(id: string, data: any) {
        return await db.users.update({ where: { id: id }, data: data })
    }
    async deleteUser(id: string) {
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
    async createUserPhoto(userId: string, photo: string) {
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        if (photpBytes.length > 500000) return new Error("The size is greater than the maximum value");
        // 
        const p = await db.u_photos.create({ data: { userId: userId, photo: photpBytes } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async updateUserPhoto(userId: string, photo: string) {
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        if (photpBytes.length > 500000) return new Error("The size is greater than the maximum value");
        // 
        const p = await db.u_photos.update({ where: { userId: userId }, data: { photo: photpBytes } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async getUserPhoto(userId: string) {
        const p = await db.u_photos.findFirst({ where: { userId: userId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async setUserPhoto(userId: string, photo: string) {
        const exist = await db.u_photos.findFirst({ select: { userId: true }, where: { userId: userId, } })
        if (!await exist) return await this.createUserPhoto(userId, userId)
        else return await this.updateUserPhoto(userId, userId)
    }
    // ****************************************************************************************************
}

export const db_user = new user_controller()