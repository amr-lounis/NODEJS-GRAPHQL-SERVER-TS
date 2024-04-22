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
                    ["money_expenses", "money_required", "money_paid", "money_unpaid", "createdAt", "updatedAt"].map((x) => t.nullable.float(x));
                },
            })),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_todo.todos_get()
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
                employeeId: nonNull(stringArg()),
                agentId: nullable(stringArg()),
                valid: nullable(stringArg()),
                description: nullable(stringArg()),
                money_expenses: nullable(floatArg()),
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg()),
                money_unpaid: nullable(floatArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                if (args.employeeId != context?.jwt?.id) throw new Error(`${args.employeeId} not match ${context?.jwt?.id}.`)
                return db_todo.todo_create(args)
            },
        });
    }
});


