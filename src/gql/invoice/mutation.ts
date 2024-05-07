import { arg, booleanArg, extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { ContextType } from "../../utils";
import { invoice_create, invoice_prudect_set, invoice_prudect_set_type, invoice_update, invoice_update_type } from "./controller";

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
                validation: nullable(booleanArg()),
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
