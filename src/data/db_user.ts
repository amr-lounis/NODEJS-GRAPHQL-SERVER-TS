import { MyToken } from '../utils';
import { db } from './db';

export type userType = {
    id: string,
    roleId?: string,
    password?: string,
    description?: string,
    address?: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    fax?: string,
    email?: string,
}
class user_controller {
    // ****************************************************************************************************
    async users_get(args: { id?: string, filter_text?: string, filter_date_min?: string, filter_date_max?: string, skip?: number, take?: number }) {
        return await db.todos.findMany({
            orderBy: {
                createdAt: 'desc'
            }, where: {
                id: args.id,
                createdAt: {
                    gte: args.filter_date_min, lte: args.filter_date_max
                },
                description: {
                    contains: args.filter_text
                },
            },
            skip: args.skip,
            take: args.take,
        })
    }
    async user_authentication(id: string, password: string): Promise<String> {//Authorization
        try {
            var u = await db.users.findFirst({ where: { id: id, password: password } })
            return MyToken.Token_Create(u.id, u.roleId)
        } catch (error) {
            return ""
        }
    }
    async user_authentication_renewal(id: string, roleId: string): Promise<String> {//Authorization
        try {
            return MyToken.Token_Create(id, roleId)
        } catch (error) {
            return ""
        }
    }
    async user_create(data: userType): Promise<String> {
        await db.users.create({ data: data })
        return "ok"
    }
    async user_update(id: string, data: userType): Promise<String> {
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
        await db.users.update({
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
    async userPhoto_get(userId: string): Promise<String> {
        const p = await db.u_photos.findFirst({ where: { userId: userId } },);
        return p?.photo?.toString() ?? ""
    }
    async userPhoto_set(userId: string, photo: string): Promise<String> {
        if (photo.length > 524288) throw new Error("The size is greater than the maximum value");
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