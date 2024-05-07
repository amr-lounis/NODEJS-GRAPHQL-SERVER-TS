import { db, limitFloat } from "../../utils";
import { product_stock_quantity_updown } from "../product/controller";
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
export const invoice_delete = async (id: string): Promise<boolean> => {
    await db.invoices.delete({ where: { id: id } })
    return true
}
export const invoice_stock_p = async (invoiceId: string): Promise<boolean> => {
    if (invoiceId == undefined) throw new Error('id is required');
    await db.$transaction(async (tr) => {
        const invoice = await tr.invoices.findUnique({ where: { id: invoiceId } })
        if (invoice.validation == false) {
            const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
            await ip.map(async (x) => {
                await product_stock_quantity_updown(tr, x.productId, x.quantity)
            })
            await tr.invoices.update({
                where: { id: invoiceId }, data: {
                    validation: true
                }
            })
        }

    });
    return true
}
export const invoice_deny = async (invoiceId: string): Promise<boolean> => {
    if (invoiceId == undefined) throw new Error('id is required');
    await db.$transaction(async (t) => {

    });
    return true
}
// **************************************************************************************************** 
export type invoice_update_type = {
    id?: string,
    validation?: boolean,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    money_tax?: number,
    money_stamp?: number,
    money_paid?: number;
}
export type invoice_prudect_set_type = { invoiceId: string, prudectId: string, description?: string, money_unite?: number, quantity?: number }
