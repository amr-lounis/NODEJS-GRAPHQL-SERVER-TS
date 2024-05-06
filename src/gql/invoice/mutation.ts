import { arg, extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { ContextType, db, limitFloat, myLog } from "../../utils";

export const InvoiceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('invoice_create', {
            args: {
                type: nonNull(stringArg())//"PURCHASE" | "SALE" | "LOSS"
            },
            type: nonNull('String'),
            resolve: (parent, args: { type: string }, context: ContextType, info): Promise<string> => {
                return invoice_create(args.type, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_update', {
            args: {
                id: nonNull(stringArg()),
                validation: nullable(stringArg()),
                dealerId: nullable(stringArg()),
                description: nullable(stringArg()),
                money_tax: nullable(floatArg()),
                money_stamp: nullable(floatArg()),
                money_paid: nullable(floatArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: invoice_update_type, context: ContextType, info): Promise<boolean> => {
                return invoice_update(args.id, args)
            },
        });
        // --------------------------------------------------
        t.field('invoice_prudect_set', {
            args: {
                invoiceId: nonNull(stringArg()),
                prudectId: nonNull(stringArg()),
                description: nullable(stringArg()),
                money_unite: nullable(floatArg()),
                quantity: nullable(floatArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: invoice_prudect_set_type, context: ContextType, info): Promise<boolean> => {
                return invoice_prudect_set(args)
            },
        });
    }
})
// **************************************************************************************************** 
export const invoice_create = async (type: string, employeeId: string): Promise<string> => {
    if (type == undefined) throw new Error('type is required');
    if (employeeId == undefined) throw new Error('employeeId is required');
    const r = await db.invoices.create({
        data: {
            type: type,
            employeeId: employeeId
        }
    })
    return r.id
}
// **************************************************************************************************** 
export const invoice_update = async (id: string, args: invoice_update_type): Promise<boolean> => {
    if (id == undefined) throw new Error('id is required');
    await db.$transaction(async (t) => {
        const oldInvoice = await t.invoices.findUnique({ where: { id: id } });
        const money_net = (await t.i_products.aggregate({ _sum: { money_calc: true }, where: { invoiceId: id } }))._sum.money_calc ?? 0;
        const money_stamp = args.money_stamp ?? oldInvoice.money_stamp;
        const money_tax = args.money_tax ?? oldInvoice.money_tax;
        const money_calc = money_net + money_stamp + money_tax;
        const money_paid = args.money_paid ?? oldInvoice.money_paid;
        const money_unpaid = money_calc - money_paid
        if (money_paid < 0) throw new Error("error : money_paid < 0")
        if (money_paid > money_calc) throw new Error("error : money_paid > money_calc")

        await t.invoices.update({
            where: { id: id }, data: {
                validation: args.validation,
                employeeId: args.employeeId,
                dealerId: args.dealerId,
                description: args.description,
                money_net: money_net,
                money_stamp: money_stamp,
                money_tax: money_tax,
                money_calc: money_calc,
                money_paid: args.money_paid,
                money_unpaid: money_unpaid
            }
        })
    })
    return true
}
// **************************************************************************************************** 
type invoice_prudect_set_type = { invoiceId: string, prudectId: string, description?: string, money_unite?: number, quantity?: number }

export const invoice_prudect_set = async (args: invoice_prudect_set_type): Promise<boolean> => {
    if (args.invoiceId == undefined) throw new Error('invoiceId is required');
    if (args.prudectId == undefined) throw new Error('prudectId is required');
    await db.$transaction(async (t) => {
        const old_ip = await t.i_products.findFirst({ where: { invoiceId: args.invoiceId, productId: args.prudectId } })

        if (old_ip) {
            const money_unite = limitFloat(args.money_unite ?? old_ip.money_unite);
            const quantity = limitFloat(args.quantity ?? old_ip.quantity + 1);
            const money_calc = limitFloat(money_unite * quantity);
            // 
            if (quantity > 0) {
                await t.i_products.updateMany({
                    where: { invoiceId: args.invoiceId, productId: args.prudectId },
                    data: {
                        invoiceId: args.invoiceId,
                        productId: args.prudectId,
                        description: args.description,
                        money_unite: money_unite,
                        quantity: quantity,
                        money_calc: money_calc,
                    }
                })
            } else {
                await t.i_products.deleteMany({
                    where: { invoiceId: args.invoiceId, productId: args.prudectId }
                })
            }

        } else {
            const ps = await t.p_stocks.findFirst({ where: { productId: args.prudectId } })
            const money_unite = limitFloat(args.money_unite ?? ps.money_selling);
            const quantity = limitFloat(args.quantity ?? 1);
            const money_calc = limitFloat(money_unite * quantity);
            if (quantity > 0) {
                await t.i_products.create({
                    data: {
                        invoiceId: args.invoiceId,
                        productId: args.prudectId,
                        description: args.description,
                        money_unite: money_unite,
                        quantity: quantity,
                        money_calc: money_calc
                    }
                })
            }
        }
    })
    await invoice_update(args.invoiceId, {})
    return true
}
// **************************************************************************************************** 
export const invoice_delete = async (id: string): Promise<boolean> => {
    await db.invoices.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** 
type invoice_update_type = {
    id?: string,
    validation?: boolean,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    money_tax?: number,
    money_stamp?: number,
    money_paid?: number;
}