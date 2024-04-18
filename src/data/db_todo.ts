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
    async createTodoPhoto(TodoId: string, photo: string) {
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        if (photpBytes.length > 500000) return new Error("The size is greater than the maximum value");
        // 
        const p = await db.t_photos.create({ data: { todoId: TodoId, photo: photpBytes } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async updateTodoPhoto(TodoId: string, photo: string) {
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        if (photpBytes.length > 500000) return new Error("The size is greater than the maximum value");
        // 
        const p = await db.t_photos.update({ where: { todoId: TodoId }, data: { photo: photpBytes } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async getTodoPhoto(TodoId: string) {
        const p = await db.t_photos.findFirst({ where: { todoId: TodoId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async setTodoPhoto(TodoId: string, photo: string) {
        const exist = await db.t_photos.findFirst({ select: { todoId: true }, where: { todoId: TodoId, } })
        if (!await exist) return await this.createTodoPhoto(TodoId, TodoId)
        else return await this.updateTodoPhoto(TodoId, TodoId)
    }
    // ****************************************************************************************************
}

export const db_todo = new todo_controller()