import { extendType, floatArg, nonNull, nullable, stringArg } from 'nexus';
import { db_todo } from './controller';
import { db } from '../../data';

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

export const TodoMutation = extendType({
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


