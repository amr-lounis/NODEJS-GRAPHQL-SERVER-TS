import { toPage } from '../utils/';
import { db } from './db';

type todosInType = {
    id?: string,
    employeeId?: string,
    agentId?: string,
    validation?: string,
    filter_text?: string,
    filter_date_min?: string,
    filter_date_max?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
}
class todo_controller {
    async todos_get(args: todosInType) {
        return await db.todos.findMany({
            orderBy: {
                createdAt: 'desc'
            }, where: {
                id: args.id,
                employeeId: args.employeeId,
                agentId: args.agentId,
                validation: args.validation,
                createdAt: {
                    gte: args.filter_date_min, lte: args.filter_date_max
                },
                description: {
                    contains: args.filter_text
                },
            },
            skip: args.itemsSkip,
            take: args.itemsTake,
        })
    }

    async todos_page_get(args: todosInType) {
        const where = {
            id: args.id,
            employeeId: args.employeeId,
            agentId: args.agentId,
            validation: args.validation,
            createdAt: {
                gte: args.filter_date_min, lte: args.filter_date_max
            },
            description: {
                contains: args.filter_text
            },
        };

        const itemsCountAll = (await db.todos.aggregate({ _count: { id: true }, where }))._count.id
        const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
        const items = await db.todos.findMany({ orderBy: { createdAt: 'desc' }, where, skip: p.itemsSkip, take: p.itemsTake })

        return {
            allItemsCount: itemsCountAll,
            allPagesCount: p.pagesCountAll,
            itemsSkip: p.itemsSkip,
            itemsTake: p.itemsTake,
            pageNumber: p.pageNumber,
            itemsCount: items.length,
            items: items
        }
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