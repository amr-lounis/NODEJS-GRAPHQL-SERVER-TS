import { TransactionType, db, genID, myLog } from "../../utils";

// **************************************************************************************************** 
export const invoice_create = async (type: string, employeeId: string): Promise<string> => {
    if (type != invoice_types.PURCHASE && type != invoice_types.SALE && type != invoice_types.SALE_GR && type != invoice_types.LOSS) throw new Error('type not match');
    const r = await db.invoices.create({
        data: {
            id: genID(type),
            type: type,
            employeeId: employeeId
        }
    })
    return r.id
}
export const invoice_update = async (id: string, args: invoice_update_type): Promise<boolean> => {
    await db.$transaction(async (tr) => {
        const invoice = await tr.invoices.findUnique({ where: { id: id } });
        myLog(invoice)
        if (!invoice) throw new Error('this invoice is not exist');
        if (invoice.validation == true) throw new Error('invoice already validated.');
        if (args.money_stamp != undefined && args.money_stamp < 0) throw new Error("error : money_stamp < 0")
        if (args.money_tax != undefined && args.money_tax < 0) throw new Error("error : money_tax < 0")
        if (args.money_paid != undefined && args.money_paid < 0) throw new Error("error : money_paid < 0")

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
        const invoice = await tr.invoices.findFirst({ where: { id: args.invoiceId } })
        if (!invoice) throw new Error('invoice id not is exist');
        if (invoice.validation == true) throw new Error('invoice already validated.');
        // 
        const ip_exist = await tr.i_products.findFirst({ where: { invoiceId: args.invoiceId, productId: args.prudectId } })

        if (ip_exist) {
            const money_unite = (args.money_unite ?? ip_exist.money_unite);
            const quantity = (args.quantity ?? ip_exist.quantity + 1);
            const money_calc = (money_unite * quantity);
            // 
            if (quantity > 0) {
                await tr.i_products.updateMany({
                    where: { invoiceId: args.invoiceId, productId: args.prudectId },
                    data: {
                        // invoiceId: args.invoiceId,
                        // productId: args.prudectId,
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
            const p = await tr.products.findUnique({ where: { id: args.prudectId } })
            if (!p) throw new Error(`product id:${args.prudectId} is not exist`);

            let defult_money_unite: number;
            if (invoice.type == invoice_types.SALE) defult_money_unite = p.money_selling;
            else if (invoice.type == invoice_types.SALE_GR) defult_money_unite = p.money_selling_gr;
            else if (invoice.type == invoice_types.PURCHASE) defult_money_unite = p.money_purchase;
            else if (invoice.type == invoice_types.LOSS) defult_money_unite = p.money_purchase;

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
export const invoice_delete = async (invoiceId: string): Promise<boolean> => {
    if (invoiceId == undefined) throw new Error('invoiceId is required');
    await db.$transaction(async (tr) => {
        const invoice = await tr.invoices.findUnique({ where: { id: invoiceId } })
        if (!invoice) throw new Error('invoice not exist');
        if (invoice.validation == true) throw new Error('invoice already validated.');

        await tr.invoices.delete({ where: { id: invoiceId } })
    })
    return true
}
export const invoice_validation = async (invoiceId: string, validation: boolean): Promise<boolean> => {
    if (invoiceId == undefined) throw new Error('id is required');
    await db.$transaction(async (tr) => {
        const invoice = await tr.invoices.findUnique({ where: { id: invoiceId } })
        if (invoice.type == invoice_types.PURCHASE) {
            if (validation == true && invoice.validation == true) throw new Error('invoice already validated.');
            else if (validation == false && invoice.validation == false) throw new Error('invoice already invalidate.');

            else if (validation == true && invoice.validation == false) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, ip[i].quantity)
                await tr.invoices.update({ where: { id: invoiceId }, data: { validation: true } })
            } else if (validation == false && invoice.validation == true) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, - ip[i].quantity)
                await tr.invoices.update({ where: { id: invoiceId }, data: { validation: false } })
            }
        } else if (invoice.type == invoice_types.SALE || invoice.type == invoice_types.SALE_GR || invoice.type == invoice_types.LOSS) {
            if (validation == true && invoice.validation == false) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, -ip[i].quantity)
                await tr.invoices.update({ where: { id: invoiceId }, data: { validation: true } })
            } else if (validation == false && invoice.validation == true) {
                const ip = await tr.i_products.findMany({ where: { invoiceId: invoiceId } })
                for (let i = 0; i < ip.length; i++) await product_quantity_updown(tr, ip[i].productId, ip[i].quantity)
                await tr.invoices.update({ where: { id: invoiceId }, data: { validation: false } })
            }
        }
    });
    return true
}
// **************************************************************************************************** Transaction invoice_calc
export const invoice_calc = async (tr: TransactionType, id: string): Promise<boolean> => {
    const invoice = await tr.invoices.findUnique({ where: { id: id } });
    if (!invoice) throw new Error('invoice not exist');
    if (invoice.validation == true) throw new Error('invoice already validated.');

    const money_net = (await tr.i_products.aggregate({ _sum: { money_calc: true }, where: { invoiceId: id } }))._sum.money_calc ?? 0;
    const money_calc = money_net + invoice.money_stamp + invoice.money_tax;
    const money_unpaid = money_calc - invoice.money_paid

    if (invoice.money_paid > money_calc) throw new Error("error : money_paid > money_calc)");
    if (money_calc < 0) throw new Error("error : money_calc < 0)");
    if (money_unpaid < 0) throw new Error("error : money_unpaid < 0)");

    await tr.invoices.update({
        where: { id: id }, data: {
            money_net: money_net,
            money_calc: money_calc,
            money_unpaid: money_unpaid
        }
    })
    return true
}
// **************************************************************************************************** Transaction product_stock
export const product_quantity_updown = async (tr: TransactionType, id: string, quantity: number): Promise<boolean> => {//if  (quantity < 0) reduire else add
    const r = await tr.products.findUnique({ select: { quantity: true }, where: { id: id } })
    await tr.products.update({ where: { id: id }, data: { quantity: r.quantity + quantity } })
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

export const invoice_types = {
    PURCHASE: "PURCHASE",
    SALE: "SALE",
    SALE_GR: "SALE_GR",
    LOSS: "LOSS"
}
