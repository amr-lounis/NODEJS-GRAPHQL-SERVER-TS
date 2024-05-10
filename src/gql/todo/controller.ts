export * from './controller'
import { db, toPage } from '../../utils';

// **************************************************************************************************** 
export const todos_get = async (args: ArgsTodoQ) => {
    const itemsCountAll = (await db.todos.aggregate({
        _count: { id: true }, where: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            validation: args.validation,
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            money_unpaid: { gte: args.money_unpaid_gte, lte: args.money_unpaid_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await db.todos.findMany({
        orderBy: { createdAt: 'desc' }, where: {
            id: args.id,
            employeeId: args.employeeId,
            dealerId: args.dealerId,
            validation: args.validation,
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            money_unpaid: { gte: args.money_unpaid_gte, lte: args.money_unpaid_lte },
            description: { contains: args.filter_description },
        }, skip: p.itemsSkip, take: p.itemsTake
    })

    return {
        allItemsCount: itemsCountAll,
        allPagesCount: p.allPagesCount,
        itemsSkip: p.itemsSkip,
        itemsTake: p.itemsTake,
        pageNumber: p.pageNumber,
        itemsCount: items.length,
        items: items
    }
}
export const todo_photo_get = async (args: ArgsTodoQ): Promise<string> => {
    const p = await db.t_photos.findFirst({ where: { todoId: args.todoId } },);
    if (!p) throw new Error('this id is not exist');
    return p?.photo?.toString() ?? ""
}
export const todo_create = async (args: ArgsTodoM): Promise<string> => {
    if (args.employeeId == undefined) throw new Error('id is required');
    if (args.money_expenses < 0) throw new Error("error : money_expenses < 0")
    if (args.money_total < 0) throw new Error("error : money_total < 0")
    if (args.money_paid < 0) throw new Error("error : money_paid < 0")
    if (args.money_paid > args.money_total) throw new Error("error : money_paid < 0")
    return await db.$transaction(async (t) => {
        const r = await t.todos.create({
            data: {
                employeeId: args.employeeId,
                dealerId: args.dealerId,
                description: args.description,
                validation: args.validation,
                money_expenses: args.money_expenses,
                money_total: args.money_total,
                money_paid: args.money_paid,
                money_unpaid: args.money_total - args.money_paid,
                money_margin: args.money_total - args.money_expenses
            }
        });
        await t.t_photos.create({
            data: { todoId: r.id, photo: Buffer.from("", 'utf8') }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.t_photos.update({ where: { todoId: r.id }, data: { photo: photpBytes } });
        }
        return r.id
    });
}
export const todo_update = async (id: string, args: ArgsTodoM) => {
    if (id == undefined) throw new Error('id is required');
    if (args.money_expenses < 0) throw new Error("error : money_expenses < 0")
    if (args.money_total < 0) throw new Error("error : money_total < 0")
    if ((args.money_paid < 0) || (args.money_paid > args.money_total)) throw new Error("error : money_paid  < 0")
    return await db.$transaction(async (t) => {
        const r = await t.todos.update({
            where: {
                id: id
            },
            data: {
                employeeId: args.employeeId,
                dealerId: args.dealerId,
                description: args.description,
                validation: args.validation,
                money_expenses: args.money_expenses,
                money_total: args.money_total,
                money_paid: args.money_paid,
                money_unpaid: args.money_total - args.money_paid,
                money_margin: args.money_total - args.money_expenses
            }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.t_photos.update({ where: { todoId: id }, data: { photo: photpBytes } });
        }
        return true
    });
}
export const todo_delete = async (id: string) => {
    await db.todos.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** 
export type ArgsTodoQ = {
    id?: string,
    todoId?: string,
    employeeId?: string,
    dealerId?: string,
    validation?: boolean,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
    money_unpaid_gte?: number,
    money_unpaid_lte?: number,
}
export type ArgsTodoM = {
    id?: string,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    validation?: boolean,
    money_expenses?: number,
    money_total?: number,
    money_paid?: number,
    photo?: string,
}
// **************************************************************************************************** 