import { db } from './db';

class todo_controller {
    async todos_get() {
        return await db.todos.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async todo_get(id: string) {
        return await db.todos.findUnique({
            where: {
                id: id
            },
        });
    }
    async todo_create(data): Promise<string> {
        const r = await db.todos.create({ data: data })
        return r.id
    }
    async todo_update(id: string, data: any): Promise<string> {
        await db.todos.update({ where: { id: id }, data: data })
        return "ok"
    }
    async todo_delete(id: string): Promise<string> {
        await db.todos.delete({ where: { id: id } })
        return "ok"
    }
    // ****************************************************************************************************
    async todoPhoto_get(todoId: string): Promise<string> {
        const p = await db.t_photos.findFirst({ where: { todoId: todoId } },);
        return p?.photo?.toString() ?? ""
    }
    async todoPhoto_set(todoId: string, photo: string): Promise<string> {
        if (photo.length > 524288) throw new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        // 
        const exist = await db.t_photos.findFirst({ select: { todoId: true }, where: { todoId: todoId } }) ? true : false
        if (!await exist) {
            const p = await db.t_photos.create({ data: { todoId: todoId, photo: photpBytes } },);
            return "ok"
        }
        else {
            const p = await db.t_photos.update({ where: { todoId: todoId }, data: { photo: photpBytes } },);
            return "ok"
        }
    }
    // ****************************************************************************************************
}

export const db_todo = new todo_controller()