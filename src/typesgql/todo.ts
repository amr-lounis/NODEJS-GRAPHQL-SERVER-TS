import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { db_setting } from '../data/db_setting';
import { db_todo } from 'src/data/db_todo';

export const todoMutation = extendType({
    type: 'Mutation',
    definition(t) {
        // **************************************************************************************************** 
        t.field('todo_set', {
            args: {
                key: nonNull(stringArg()),
                value: nonNull(stringArg()),
            },
            // ------------------------------
            type: nonNull('String'),
            // ------------------------------
            resolve(parent, args, context, info) {
                return db_setting.setting_set(args.key, args.value)
            },
        });
    }
});

export const todoQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('todos_get', {
            args: {},
            // ------------------------------
            type: list(objectType({
                name: 'todos_get_out',
                definition(t) {
                    ["id", "employeeId", "agentId", "valid"].map((x) => t.nullable.string(x));
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

