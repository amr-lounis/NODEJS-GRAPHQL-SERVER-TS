import { booleanArg, extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { ContextType } from "../../utils";
import { invoice_create, invoice_update_prudect, invoice_prudect_set_type, invoice_types, invoice_update, invoice_update_type, invoice_update_validation } from "./controller";

export const InvoiceMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('invoice_create_purchase', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.PURCHASE, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_create_sale', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.SALE, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_create_sale_gr', {
            args: {},
            type: nonNull('String'),
            resolve: (parent, args, context: ContextType, info): Promise<string> => {
                return invoice_create(invoice_types.SALE_GR, context.jwt.id)
            },
        });
        // --------------------------------------------------
        t.field('invoice_create_loss', {
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
        t.field('invoice_update_prudect', {
            args: {
                invoiceId: nonNull(stringArg()),
                prudectId: nonNull(stringArg()),
                description: nullable(stringArg()),
                money_unite: nullable(floatArg()),
                quantity: nullable(floatArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: invoice_prudect_set_type, context: ContextType, info): Promise<boolean> => {
                return invoice_update_prudect(args)
            },
        });
        // --------------------------------------------------
        t.field('invoice_set_valid', {
            args: {
                invoiceId: nonNull(stringArg())
            },
            type: nonNull('String'),
            resolve: (parent, args: { invoiceId: string }, context: ContextType, info): Promise<string> => {
                return invoice_update_validation(args.invoiceId, true)
            },
        });
        // --------------------------------------------------
        t.field('invoice_set_invalid', {
            args: {
                invoiceId: nonNull(stringArg()),
                validation: nonNull(booleanArg()),
            },
            type: nonNull('String'),
            resolve: (parent, args: { invoiceId: string }, context: ContextType, info): Promise<string> => {
                return invoice_update_validation(args.invoiceId, false)
            },
        });
    }
})
