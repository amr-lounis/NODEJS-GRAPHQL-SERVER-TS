import { extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { ArgsProductType, product_categorie_create, product_categorie_delete, product_categorie_update, product_create, product_delete, product_update, product_unity_create, product_unity_delete, product_unity_update } from "./controller";

// **************************************************************************************************** 
export const ProductMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('product_unity_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return product_unity_create(args.id)
            },
        });
        t.field('product_unity_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string, idNew: string }, context, info): Promise<boolean> => {
                return product_unity_update(args.id, args.idNew)
            },
        });
        t.field('product_unity_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id: string }, context, info): Promise<boolean> => {
                return product_unity_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('product_categorie_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return product_categorie_create(args.id)
            },
        });
        t.field('product_categorie_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string, idNew: string }, context, info): Promise<boolean> => {
                return product_categorie_update(args.id, args.idNew)
            },
        });
        t.field('product_categorie_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('Boolean'),
            resolve: (parent, args: { id?: string }, context, info): Promise<boolean> => {
                return product_categorie_delete(args.id)
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
                money_purchase: nullable(floatArg()),
                money_selling: nullable(floatArg()),
                money_selling_gr: nullable(floatArg()),
                date_alert: nullable(stringArg()),
                quantity_alert: nullable(floatArg()),
                // quantity: nullable(floatArg()),
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
                money_purchase: nullable(floatArg()),
                money_selling: nullable(floatArg()),
                money_selling_gr: nullable(floatArg()),
                date_alert: nullable(stringArg()),
                quantity_alert: nullable(floatArg()),
                // quantity: nullable(floatArg()),
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
    }
});