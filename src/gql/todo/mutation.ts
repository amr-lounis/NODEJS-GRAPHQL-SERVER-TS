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
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            type: nonNull('String'),
            resolve(parent: any, args: ArgsTodoM, context: ContextType, info: any) {
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
                money_required: nullable(floatArg()),
                money_paid: nullable(floatArg())
            },
            type: nonNull('String'),
            async resolve(parent: any, args: ArgsTodoM, context: ContextType, info: any) {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context.jwt.id) throw new Error('not authorized');//update only by owner
                //   
                return todo_update(args.id, args)
            },
        });
        // --------------------------------------------------
        t.field('todo_delete', {
            args: { id: nonNull(stringArg()), },
            type: nonNull('String'),
            async resolve(parent: any, args: { id: string }, context: ContextType, info: any) {
                const r = await db.todos.findUnique({ where: { id: args.id } })
                if (r.employeeId != context.jwt.id) throw new Error('not authorized');
                // 
                return todo_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('todo_photo_update', {
            args: { todoId: nonNull(stringArg()), photo: nonNull(stringArg()) },
            type: nonNull("String"),
            async resolve(parent: any, args: { todoId: string, photo: string }, context: ContextType, info: any) {
                const r = await db.todos.findUnique({ where: { id: args.todoId } })
                if (r.employeeId != context.jwt.id) throw new Error('not authorized');
                // 
                return todo_photo_set(args.todoId, args.photo)
            },
        });
    }
});
// **************************************************************************************************** 
export const todo_create = async (args: ArgsTodoM) => {
    if (args.employeeId == undefined) throw new Error('id is required');
    if (args?.money_expenses < 0) throw new Error("error : money_expenses")
    if (args?.money_required < 0) throw new Error("error : money_required")
    if ((args?.money_paid < 0) || (args?.money_paid > args?.money_required)) throw new Error("error : money_paid")
    return db.todos.create({
        data: {
            employeeId: args.employeeId,
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
}

export const todo_update = async (id: string, args: ArgsTodoM) => {
    if (id == undefined) throw new Error('id is required');
    if (args?.money_expenses < 0) throw new Error("error : money_expenses")
    if (args?.money_required < 0) throw new Error("error : money_required")
    if ((args?.money_paid < 0) || (args?.money_paid > args?.money_required)) throw new Error("error : money_paid")
    return db.todos.update({
        where: {
            id: id
        },
        data: {
            employeeId: args.employeeId,
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
}
export const todo_photo_set = async (id: string, photo: string) => {
    if (photo.length > 524288) throw new Error("The size is greater than the maximum value");
    const photpBytes = Buffer.from(photo ?? "", 'utf8')
    // 
    await db.$transaction(async (t) => {
        const exist = await t.t_photos.findFirst({ select: { todoId: true }, where: { todoId: id } }) ? true : false
        if (!exist) await t.t_photos.create({ data: { todoId: id, photo: photpBytes } },);
        else await t.t_photos.update({ where: { todoId: id }, data: { photo: photpBytes } },);
    })
    return "ok"
}
export const todo_delete = async (id: string) => {
    await db.todos.delete({ where: { id: id } })
    return "ok"
}
// **************************************************************************************************** 
type ArgsTodoM = {
    id?: string,
    employeeId?: string,
    agentId?: string,
    description?: string,
    validation?: string,
    money_expenses?: number,
    money_required?: number,
    money_paid?: number,
}
// **************************************************************************************************** 