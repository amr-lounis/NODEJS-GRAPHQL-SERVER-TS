import { booleanArg, extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { ContextType } from "../../utils";
import { invoice_create, invoice_prudect_set, invoice_prudect_set_type, invoice_types, invoice_update, invoice_update_type, invoice_validation } from "./controller";

export const InvoiceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('invoice_purchase_create', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.PURCHASE, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_sale_create', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.SALE, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_loss_create', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.LOSS, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_update', {
            args: {
                id: nonNull(stringArg()),
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
        // --------------------------------------------------
        t.field('invoice_validation', {
            args: {
                invoiceId: nonNull(stringArg()),
                validation: nonNull(booleanArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: { invoiceId: string, validation: boolean }, context: ContextType, info): Promise<boolean> => {
                return invoice_validation(args.invoiceId, args.validation)
            },
        });
    }
})