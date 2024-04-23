import { arg, extendType, floatArg, list, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db_todo } from '../data/db_todo';

export const todoQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('todos_get', {
            args: {},
            // ------------------------------
            type: list(objectType({
                name: 'todos_get_out',
                definition(t) {
                    ["id", "employeeId", "agentId", "valid", "description"].map((x) => t.nullable.string(x));
                    ["money_expenses", "money_required", "money_paid", "money_unpaid", "money_margin", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_todo.todos_get()
            },
        });
        t.field('todo_get', {
            args: {
                id: nonNull(stringArg())
            },
            // ------------------------------
            type: objectType({
                name: 'todo_get_out',
                definition(t) {
                    ["id", "employeeId", "agentId", "valid", "description"].map((x) => t.nullable.string(x));
                    ["money_expenses", "money_required", "money_paid", "money_unpaid", "money_margin", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
                },
            }),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_todo.todo_get(args.id)
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
            resolve(parent, args, context, info) {
                args.employeeId = context?.jwt?.id
                args.money_unpaid = args.money_required - args.money_paid;
                args.money_margin = args.money_paid - args.money_expenses;
                return db_todo.todo_create(args)
            },
        });
        // **************************************************************************************************** 
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
            resolve(parent, args, context, info) {
                args.employeeId = context?.jwt?.id
                args.money_unpaid = args.money_required - args.money_paid;
                args.money_margin = args.money_paid - args.money_expenses;
                return db_todo.todo_update(args.id, args)
            },
        });

        // **************************************************************************************************** 
        t.field('todo_delete', {
            args: {
                id: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_todo.todo_delete(args.id)
            },
        });
        // **************************************************************************************************** 
        t.field('todoPhoto_update', {
            args: {
                todoId: nonNull(stringArg()),
                photo: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull("String"),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_todo.todoPhoto_set(args.todoId, args.photo)
            },
        });
    }
});


