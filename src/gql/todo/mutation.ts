import { booleanArg, extendType, floatArg, nonNull, nullable, stringArg } from 'nexus';
import { db, ContextType } from '../../utils';
import { ArgsTodoM, todo_create, todo_delete, todo_update } from './controller';
// **************************************************************************************************** 
export const TodoMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('todo_create', {
            args: {
                dealerId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(booleanArg()),
                money_expenses: nullable(floatArg()),
                money_total: nullable(floatArg()),
                money_paid: nullable(floatArg()),
                photo: nullable(stringArg()),
            },
            description: "return ID of new todo",
            type: nonNull('String'), // -------------------------------------------------- return ID of new todo
            resolve: (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<string> => {
                args.employeeId = context.jwt.id
                return todo_create(args)
            }
        });
        // --------------------------------------------------
        t.field('todo_update', {
            args: {
                id: nonNull(stringArg()),
                dealerId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(booleanArg()),
                money_expenses: nullable(floatArg()),
                money_total: nullable(floatArg()),
                money_paid: nullable(floatArg()),
                photo: nullable(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: ArgsTodoM, context: ContextType, info: any): Promise<boolean> => {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context.jwt.id) throw new Error('not authorized : update only by owner');
                //   
                return todo_update(args.id, args)
            },
        });
        // --------------------------------------------------
        t.field('todo_delete', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: async (parent: any, args: { id: string }, context: ContextType, info: any): Promise<boolean> => {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context.jwt.id) throw new Error('not authorized : update only by owner');
                // 
                return todo_delete(args.id)
            },
        });
    }
});