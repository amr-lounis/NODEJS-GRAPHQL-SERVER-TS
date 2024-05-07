import { TransactionType } from "../../utils";
import { ArgsStockType } from "../product";
// ****************************************************************************************************
export const invoice_calc = async (tr: TransactionType, id: string): Promise<boolean> => {
    const oldInvoice = await tr.invoices.findUnique({ where: { id: id } });
    if (!oldInvoice) throw new Error('this invoice is not exist');
    if (oldInvoice.validation == true) throw new Error('this invoice is validated');

    const money_net = (await tr.i_products.aggregate({ _sum: { money_calc: true }, where: { invoiceId: id } }))._sum.money_calc ?? 0;
    const money_calc = money_net + oldInvoice.money_stamp + oldInvoice.money_tax;
    const money_unpaid = money_calc - oldInvoice.money_paid

    if (oldInvoice.money_paid > money_calc) throw new Error("error : money_paid > money_calc)");
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
// **************************************************************************************************** product_stock
export const product_stock_set = async (tr: TransactionType, args: ArgsStockType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : productId is required');
    if (args.money_purchase < 0) throw new Error('error : money_purchase < 0');
    if (args.money_selling < 0) throw new Error('error : money_selling < 0');
    if (args.quantity < 0) throw new Error("error : quantity < 0)");

    const exist_p = await tr.products.findFirst({ select: { id: true }, where: { id: args.id } }) ? true : false;
    if (!exist_p) throw new Error(`error : product id : ${args.id} is not exist`);
    await tr.p_stocks.update({
        where: { productId: args.id }, data: {
            // productId: args.productId,
            money_purchase: args.money_purchase,
            money_selling: args.money_selling,
            quantity: args.quantity,
            quantity_critical: args.quantity_critical,
            date_production: args.date_production,
            date_expiration: args.date_expiration,
        }
    },);

    return true
}
export const product_stock_quantity_updown = async (tr: TransactionType, id: string, quantity: number): Promise<boolean> => {//if  (quantity < 0) reduire else add
    const r = await tr.p_stocks.findUnique({ select: { quantity: true }, where: { productId: id } })
    if ((r.quantity + quantity) < 0) throw new Error("error : quantity");
    await product_stock_set(tr, { id: id, quantity: r.quantity + quantity })
    return true
}