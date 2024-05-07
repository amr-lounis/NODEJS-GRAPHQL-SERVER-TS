import { TransactionType, db, limitFloat } from "../../utils";
import { invoice_calc, product_stock_quantity_updown } from "./controller_tr";
// **************************************************************************************************** 
export const invoice_create = async (type: 'PURCHASE' | 'SALE' | 'LOSS', employeeId: string): Promise<string> => {
    if (type == invoice_types.PURCHASE || type == invoice_types.SALE || type == invoice_types.LOSS) throw new Error('type not match');
    const r = await db.invoices.create({
        data: {
            type: type,
            employeeId: employeeId
        }
    })
    return r.id
}
export const invoice_update = async (id: string, args: invoice_update_type): Promise<boolean> => {
    await db.$transaction(async (tr) => {
        const oldInvoice = await tr.invoices.findUnique({ where: { id: id } });
        if (!oldInvoice) throw new Error('this invoice is not exist');
        if (oldInvoice.validation == true) throw new Error('this invoice is validated');
        if (args.money_paid < 0) throw new Error("error : money_paid < 0")

        await tr.invoices.update({
            where: { id: id }, data: {
                employeeId: args.employeeId,
                dealerId: args.dealerId,
                description: args.description,

                money_stamp: args.money_stamp,
                money_tax: args.money_tax,
                money_paid: args.money_paid
            }
        })
        await invoice_calc(tr, id)
    })
    return true
}

export const invoice_prudect_set = async (args: invoice_prudect_set_type): Promise<boolean> => {
    if (args.invoiceId == undefined) throw new Error('invoiceId is required');
    if (args.prudectId == undefined) throw new Error('prudectId is required');
    await db.$transaction(async (tr) => {
        const oldInvoice = await tr.invoices.findFirst({ where: { id: args.invoiceId } })
        if (!oldInvoice) throw new Error('invoice not is exist');
        const old_ip = await tr.i_products.findFirst({ where: { invoiceId: args.invoiceId, productId: args.prudectId } })

        if (old_ip) {
            if (oldInvoice.validation == true) throw new Error('this invoice is validated');
            const money_unite = (args.money_unite ?? old_ip.money_unite);
            const quantity = (args.quantity ?? old_ip.quantity + 1);
            const money_calc = (money_unite * quantity);
            // 
            if (quantity > 0) {
                await tr.i_products.updateMany({
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
                await tr.i_products.deleteMany({
                    where: { invoiceId: args.invoiceId, productId: args.prudectId }
                })
            }

        } else {
            const ps = await tr.p_stocks.findFirst({ where: { productId: args.prudectId } })
            const defult_money_unite = oldInvoice.type == invoice_types.SALE ? ps.money_selling : ps.money_purchase;
            const money_unite = args.money_unite ?? defult_money_unite;
            const quantity = (args.quantity ?? 1);
            const money_calc = (money_unite * quantity);
            if (quantity > 0) {
                await tr.i_products.create({
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
        await invoice_calc(tr, args.invoiceId)
    })

    return true
}
export const invoice_delete = async (id: string): Promise<boolean> => {
    await db.invoices.delete({ where: { id: id } })
    return true
}
export const invoice_validation = async (invoiceId: string, validation: boolean): Promise<boolean> => {
    if (invoiceId == undefined) throw new Error('id is required');
    await db.$transaction(async (tr) => {
        const invoice = await tr.invoices.findUnique({ where: { id: invoiceId } })
        if (invoice.type == invoice_types.PURCHASE) {
            if (validation == true && invoice.validation == false) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                await ip.map(async (x) => {
                    await product_stock_quantity_updown(tr, x.productId, x.quantity)
                })
                await tr.invoices.update({
                    where: { id: invoiceId }, data: { validation: true }
                })
            } else if (validation == false && invoice.validation == true) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                await ip.map(async (x) => {
                    await product_stock_quantity_updown(tr, x.productId, - x.quantity)
                })
                await tr.invoices.update({
                    where: { id: invoiceId }, data: { validation: false }
                })
            }
        } else if (invoice.type == invoice_types.SALE || invoice.type == invoice_types.LOSS) {
            if (validation == true && invoice.validation == false) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                await ip.map(async (x) => {
                    await product_stock_quantity_updown(tr, x.productId, -x.quantity)
                })
                await tr.invoices.update({
                    where: { id: invoiceId }, data: { validation: true }
                })
            } else if (validation == false && invoice.validation == true) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                await ip.map(async (x) => {
                    await product_stock_quantity_updown(tr, x.productId, x.quantity)
                })
                await tr.invoices.update({
                    where: { id: invoiceId }, data: { validation: false }
                })
            }
        }
    });
    return true
}
// **************************************************************************************************** 
export type invoice_update_type = {
    id?: string,
    employeeId?: string,
    dealerId?: string,
    description?: string,
    money_tax?: number,
    money_stamp?: number,
    money_paid?: number;
}
export type invoice_prudect_set_type = { invoiceId: string, prudectId: string, description?: string, money_unite?: number, quantity?: number }

export enum invoice_types {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    LOSS = "LOSS"
}