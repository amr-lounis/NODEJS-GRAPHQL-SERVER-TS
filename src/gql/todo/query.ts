import { extendType, floatArg, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, toPage } from '../../utils';
// **************************************************************************************************** 
export const TodoQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('todos_get', {
            args: {
                id: nullable(stringArg()),
                employeeId: nullable(stringArg()),
                dealerId: nullable(stringArg()),
                validation: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
                money_unpaid_gte: nullable(floatArg()),
                money_unpaid_lte: nullable(floatArg()),
            },
            description: "date format : 2000-01-01T00:00:00Z",
            type: todos_out,
            resolve: async (parent, args: ArgsTodoQ, context, info) => {
                return todos_get(args)
            },
        });
        // --------------------------------------------------
        t.field('todo_photo_get', {
            args: { todoId: nonNull(stringArg()) },
            type: nonNull("String"),
            resolve: async (parent, args: ArgsTodoQ, context, info): Promise<string> => {
                return todo_photo_get(args)
            },
        });
    }
});
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
    return p?.photo?.toString() ?? ""
}
// **************************************************************************************************** 
export const todo_get_out = objectType({
    name: 'todo_get_out',
    definition(t) {
        ["id", "employeeId", "dealerId", "validation", "description"].map((x) => t.nullable.string(x));
        ["money_expenses", "money_total", "money_paid", "money_unpaid", "money_margin", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
    },
});
export const todos_out = objectType({
    name: 'todos_get_out',
    definition(t) {
        t.nullable.int('allItemsCount')
        t.nullable.int('allPagesCount')
        t.nullable.int('pageNumber')
        t.nullable.int('itemsTake')
        t.nullable.int('itemsSkip')
        t.nullable.int('itemsCount')
        t.nullable.list.field('items', { type: 'todo_get_out' })
    },
});
export type ArgsTodoQ = {
    id?: string,
    todoId?: string,
    employeeId?: string,
    dealerId?: string,
    validation?: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
    money_unpaid_gte?: number,
    money_unpaid_lte?: number,
}