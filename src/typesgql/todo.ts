import { extendType, floatArg, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db_todo } from '../data/db_todo';
import { db } from '../data';
import { toPage } from '../utils';

export type ArgsTodosQ = {
    id?: string,
    todoId?: string,
    employeeId?: string,
    agentId?: string,
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

export type ArgsTodosM = {
    id?: string,
    todoId?: string,
    description: string,
    employeeId?: string,
    agentId?: string,
    money_margin?: number,
    money_required?: number,
    money_paid?: number,
    money_unpaid?: number,
    money_expenses?: number,
    validation?: string,
    filter_description?: string,
    filter_create_min?: string,
    filter_create_max?: string,
    pageNumber?: number,
    itemsTake?: number,
    photo?: string,
}

export const todo_get_out = objectType({
    name: 'todo_get_out',
    definition(t) {
        ["id", "employeeId", "agentId", "validation", "description", "createdAt", "updatedAt"].map((x) => t.nullable.string(x));
        ["money_expenses", "money_required", "money_paid", "money_unpaid", "money_margin",].map((x) => t.nullable.float(x));
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

export const todoQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('todos_get', {
            args: {
                id: nullable(stringArg()),
                employeeId: nullable(stringArg()),
                agentId: nullable(stringArg()),
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
            // ------------------------------
            type: todos_out,
            // ------------------------------
            async resolve(parent, args: ArgsTodosQ, context, info) {
                const where = {
                    id: args.id,
                    employeeId: args.employeeId,
                    agentId: args.agentId,
                    validation: args.validation,
                    createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
                    money_unpaid: { gte: args.money_unpaid_gte, lte: args.money_unpaid_lte },
                    description: { contains: args.filter_description },
                };

                const itemsCountAll = (await db.todos.aggregate({ _count: { id: true }, where }))._count.id
                const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
                const items = await db.todos.findMany({ orderBy: { createdAt: 'desc' }, where, skip: p.itemsSkip, take: p.itemsTake })

                return {
                    allItemsCount: itemsCountAll,
                    allPagesCount: p.allPagesCount,
                    itemsSkip: p.itemsSkip,
                    itemsTake: p.itemsTake,
                    pageNumber: p.pageNumber,
                    itemsCount: items.length,
                    items: items
                }
            },
        });
        t.field('todoPhoto_get', {
            args: {
                todoId: nonNull(stringArg())
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            async resolve(parent, args: ArgsTodosQ, context, info) {
                return db_todo.todoPhoto_get(args.todoId)
            },
        });
    }
});

export const todoMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('todo_create', {
            args: {
                agentId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            async resolve(parent, args: ArgsTodosM, context, info) {
                if (args?.money_expenses < 0) throw new Error("error : money_expenses")
                if (args?.money_required < 0) throw new Error("error : money_required")
                if ((args?.money_paid < 0) || (args?.money_paid > args?.money_required)) throw new Error("error : money_paid")
                // 
                await db.todos.create({
                    data: {
                        employeeId: context?.jwt?.id,
                        agentId: args.agentId ?? null,
                        description: args.description,
                        validation: args.validation,
                        money_expenses: args.money_expenses,
                        money_required: args.money_required,
                        money_paid: args.money_paid,
                        money_unpaid: args.money_required - args.money_paid,
                        money_margin: args.money_paid - args.money_expenses
                    }
                })
                return "ok"
            },
        });
        // ****************************************************************************************************  //update only by owner
        t.field('todo_update', {
            args: {
                id: nonNull(stringArg()),
                agentId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            async resolve(parent, args: ArgsTodosM, context, info) {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context?.jwt?.id) throw new Error('not authorized');
                if (args?.money_expenses < 0) throw new Error("error : money_expenses")
                if (args?.money_required < 0) throw new Error("error : money_required")
                if ((args?.money_paid < 0) || (args?.money_paid > args?.money_required)) throw new Error("error : money_paid")
                // 
                return db.todos.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        agentId: args.agentId,
                        description: args.description,
                        validation: args.validation,
                        money_expenses: args.money_expenses,
                        money_required: args.money_required,
                        money_paid: args.money_paid,
                        money_unpaid: args.money_required - args.money_paid,
                        money_margin: args.money_paid - args.money_expenses
                    }
                })
            },
        });
        // ****************************************************************************************************  //delete only by owner
        t.field('todo_delete', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            async resolve(parent, args: ArgsTodosM, context, info) {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context?.jwt?.id) throw new Error('not authorized');
                // 
                return db_todo.todo_delete(args.id)
            },
        });
        // **************************************************************************************************** //update only by owner
        t.field('todoPhoto_update', {
            args: {
                todoId: nonNull(stringArg()),
                photo: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            async resolve(parent, args: ArgsTodosM, context, info) {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context?.jwt?.id) throw new Error('not authorized');
                // 
                return db_todo.todoPhoto_set(args.todoId, args.photo)
            },
        });
    }
});


