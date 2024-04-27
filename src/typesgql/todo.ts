import { arg, extendType, floatArg, intArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db_todo } from '../data/db_todo';

export type ArgsTodosQ = {
    id?: string,
    todoId?: string,
    employeeId?: string,
    agentId?: string,
    validation?: string,
    filter_description?: string,
    filter_create_min?: string,
    filter_create_max?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
}

export type ArgsTodosM = {
    id?: string,
    todoId?: string,
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

export const todos_page_out = objectType({
    name: 'todos_page_out',
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
        t.field('todos_page_get', {
            args: {
                id: nullable(stringArg()),
                employeeId: nullable(stringArg()),
                agentId: nullable(stringArg()),
                validation: nullable(stringArg()),
                filter_create_min: nullable(stringArg()),
                filter_create_max: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
            },
            description: "date format : 2000-01-01T00:00:00Z",
            // ------------------------------
            type: todos_page_out,
            // ------------------------------
            resolve(parent, args: ArgsTodosQ, context, info) {
                return db_todo.todos_page_get(args)
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
                valid: nullable(stringArg()),
                description: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args: ArgsTodosM, context, info) {
                args.employeeId = context?.jwt?.id
                args.money_unpaid = args.money_required - args.money_paid;
                args.money_margin = args.money_paid - args.money_expenses;
                return db_todo.todo_create(args)
            },
        });
        // ****************************************************************************************************  //update only by owner
        t.field('todo_update', {
            args: {
                id: nonNull(stringArg()),
                agentId: nullable(stringArg()),
                valid: nullable(stringArg()),
                description: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            async resolve(parent, args: ArgsTodosM, context, info) {
                const r = (await db_todo.todos_get({ id: args.id }))[0]
                if (r.employeeId != context?.jwt?.id) throw new Error('not authorized');
                // 
                args.money_unpaid = args.money_required - args.money_paid;
                args.money_margin = args.money_paid - args.money_expenses;
                return db_todo.todo_update(args.id, args)
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
                const r = (await db_todo.todos_get({ id: args.id }))[0]
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
                const r = (await db_todo.todos_get({ id: args.todoId }))[0]
                if (r.employeeId != context?.jwt?.id) throw new Error('not authorized');
                // 
                return db_todo.todoPhoto_set(args.todoId, args.photo)
            },
        });
    }
});


