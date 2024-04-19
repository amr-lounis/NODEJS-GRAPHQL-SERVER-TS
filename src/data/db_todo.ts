import { db } from './db';

export const createTodo = (data) => {
    return db.todos.create({ data: data })
}
class todo_controller {
    async createTodo(data) {
        return await db.todos.create({ data: data })
    }
    async getTodos() {
        return await db.todos.findMany({});
    }
    async updateTodo(id: string, data: any) {
        return await db.todos.update({ where: { id: id }, data: data })
    }
    async deleteTodo(id: string,) {
        return await db.todos.delete({ where: { id: id } })
    }
    // ****************************************************************************************************
    async getTodoPhoto(todoId: string) {
        const p = await db.t_photos.findFirst({ where: { todoId: todoId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async setTodoPhoto(todoId: string, photo: string) {
        if (photo.length > 524288) return new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        // 
        const exist = await db.t_photos.findFirst({ select: { todoId: true }, where: { todoId: todoId } }) ? true : false
        if (!await exist) {
            const p = await db.t_photos.create({ data: { todoId: todoId, photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
        else {
            const p = await db.t_photos.update({ where: { todoId: todoId }, data: { photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
    }
    // ****************************************************************************************************
}

export const db_todo = new todo_controller()