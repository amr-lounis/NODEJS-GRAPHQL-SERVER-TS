import { extendType, floatArg, nonNull, nullable, stringArg } from 'nexus';
import { db, ContextType } from '../../utils';
// **************************************************************************************************** 
export const TodoMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('todo_create', {
            args: {
                agentId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(stringArg()),
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
                agentId: nullable(stringArg()),
                description: nullable(stringArg()),
                validation: nullable(stringArg()),
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
// **************************************************************************************************** 
export const todo_create = async (args: ArgsTodoM): Promise<string> => {
    if (args.employeeId == undefined) throw new Error('id is required');
    if (args.money_expenses < 0) throw new Error("error : money_expenses < 0")
    if (args.money_total < 0) throw new Error("error : money_total < 0")
    if ((args.money_paid < 0) || (args.money_paid > args.money_total)) throw new Error("error : money_paid < 0")
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
                money_margin: args.money_paid - args.money_expenses
            }
        });
        await t.t_photos.create({
            data: { todoId: args.id, photo: Buffer.from("", 'utf8') }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.t_photos.update({ where: { todoId: args.id }, data: { photo: photpBytes } });
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
                money_margin: args.money_paid - args.money_expenses
            }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.t_photos.update({ where: { todoId: args.id }, data: { photo: photpBytes } });
        }
        return true
    });
}

export const todo_delete = async (id: string) => {
    await db.todos.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** 
type ArgsTodoM = {
    id?: string,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    validation?: string,
    money_expenses?: number,
    money_total?: number,
    money_paid?: number,
    photo?: string,
}
// **************************************************************************************************** 