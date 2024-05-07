import { extendType, nonNull, nullable, stringArg } from "nexus";
import { ArgsProductType, categorie_create, categorie_delete, categorie_update, product_create, product_delete, product_update, unity_create, unity_delete, unity_update } from "./controller";

// **************************************************************************************************** 
export const ProductMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('product_unity_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return unity_create(args.id)
            },
        });
        t.field('product_unity_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return unity_update(args.id, args.idNew)
            },
        });
        t.field('product_unity_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return unity_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('product_categorie_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return categorie_create(args.id)
            },
        });
        t.field('product_categorie_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string, idNew: string }, context, info): Promise<boolean> => {
                return categorie_update(args.id, args.idNew)
            },
        });
        t.field('product_categorie_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return categorie_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('product__create', {
            args: {
                id: nonNull(stringArg()),
                categorieId: nullable(stringArg()),
                unityId: nullable(stringArg()),
                code: nullable(stringArg()),
                description: nullable(stringArg()),
                photo: nullable(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsProductType, context, info): Promise<boolean> => {
                return product_create(args)
            },
        });
        t.field('product__update', {
            args: {
                id: nonNull(stringArg()),
                categorieId: nonNull(stringArg()),
                unityId: nonNull(stringArg()),
                code: nonNull(stringArg()),
                description: nonNull(stringArg()),
                photo: nullable(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsProductType, context, info): Promise<boolean> => {
                return product_update(args.id, args)
            },
        });
        t.field('product__id_update', {
            args: {
                id: nonNull(stringArg()),
                idNew: nonNull(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return product_update(args.id, { id: args.idNew })
            },
        });
        t.field('product__delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return product_delete(args.id)
            },
        });
        // --------------------------------------------------
        // t.field('product_stock_set', {
        //     args: {
        //         productId: nonNull(stringArg()),
        //         money_purchase: nullable(floatArg()),
        //         money_selling: nullable(floatArg()),
        //         quantity: nullable(floatArg()),
        //         quantity_critical: nullable(floatArg()),
        //         date_production: nullable(stringArg()),
        //         date_expiration: nullable(stringArg()),
        //     },
        //     type: nonNull('Boolean'),
        //     resolve: (parent, args: ArgsStockType, context, info): Promise<boolean> => {
        //         return product_stock_set(args)
        //     },
        // });
        // --------------------------------------------------
        // t.field('product_stock_quantity_updown', {
        //     args: {
        //         id: nonNull(stringArg()),
        //         quantity: nonNull(floatArg())
        //     },
        //     type: nonNull('Boolean'),
        //     resolve: (parent, args: ArgsStockType, context, info): Promise<boolean> => {
        //         return product_stock_quantity_updown(args.id, args.quantity)
        //     },
        // });
    }
});