import { extendType, floatArg, nonNull, nullable, stringArg } from "nexus";
import { db } from "../../utils";

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
        t.field('product_stock_set', {
            args: {
                productId: nonNull(stringArg()),
                money_purchase: nullable(floatArg()),
                money_selling: nullable(floatArg()),
                quantity: nullable(floatArg()),
                quantity_critical: nullable(floatArg()),
                date_production: nullable(stringArg()),
                date_expiration: nullable(stringArg()),
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsStockType, context, info): Promise<boolean> => {
                return product_stock_set(args)
            },
        });
        // --------------------------------------------------
        t.field('product_stock_quantity_updown', {
            args: {
                id: nonNull(stringArg()),
                quantity: nonNull(floatArg())
            },
            type: nonNull('Boolean'),
            resolve: (parent, args: ArgsStockType, context, info): Promise<boolean> => {
                return product_stock_quantity_updown(args.id, args.quantity)
            },
        });
    }
});

// **************************************************************************************************** 

export const unity_create = async (id: string): Promise<boolean> => {
    await db.p_units.create({ data: { id: id } })
    return true
}
export const unity_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.p_units.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const unity_delete = async (id: string): Promise<boolean> => {
    await db.p_units.delete({ where: { id: id } })
    return true
}
// --------------------------------------------------
export const categorie_create = async (id: string): Promise<boolean> => {
    await db.p_categories.create({ data: { id: id } })
    return true
}
export const categorie_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.p_categories.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const categorie_delete = async (id: string): Promise<boolean> => {
    await db.p_categories.delete({ where: { id: id } })
    return true
}
// --------------------------------------------------
export const product_create = async (args: ArgsProductType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : id is required');
    await db.$transaction(async (t) => {
        const r = await t.products.create({
            data: {
                id: args.id,
                categorieId: args.categorieId,
                unityId: args.unityId,
                code: args.code,
                description: args.description,
            }
        })
        await t.p_photos.create({
            data: { productId: r.id, photo: Buffer.from("", 'utf8') }
        });
        await t.p_stocks.create({
            data: { productId: r.id }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.p_photos.update({ where: { productId: r.id }, data: { photo: photpBytes } });
        }
    });
    return true
}
export const product_update = async (id: string, args: ArgsProductType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : id is required');
    await db.$transaction(async (t) => {
        const exist_p = await t.products.findFirst({ select: { id: true }, where: { id: id } }) ? true : false;
        if (!exist_p) throw new Error(`error : product id : ${id} is not exist`);
        await t.products.update({
            where: {
                id: id
            },
            data: {
                id: args.id,
                categorieId: args.categorieId,
                unityId: args.unityId,
                code: args.code,
                description: args.description,
            }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.p_photos.update({ where: { productId: id }, data: { photo: photpBytes } },);
        }
    });
    return true
}


export const product_stock_set = async (args: ArgsStockType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : productId is required');
    if (args.money_purchase < 0) throw new Error('error : money_purchase < 0');
    if (args.money_selling < 0) throw new Error('error : money_selling < 0');
    if (args.quantity < 0) throw new Error("error : quantity < 0)");

    await db.$transaction(async (t) => {
        const exist_p = await t.products.findFirst({ select: { id: true }, where: { id: args.id } }) ? true : false;
        if (!exist_p) throw new Error(`error : product id : ${args.id} is not exist`);
        await t.p_stocks.update({
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
    })
    return true
}

export const product_stock_quantity_updown = async (id: string, quantity: number): Promise<boolean> => {//if  (quantity < 0) reduire else add
    await db.$transaction(async (t) => {
        const r = await t.p_stocks.findUnique({ select: { quantity: true }, where: { productId: id } })
        if ((r.quantity + quantity) < 0) throw new Error("error : quantity");
        await product_stock_set({ id: id, quantity: r.quantity + quantity })
    })
    return true
}

export const product_delete = async (id: string): Promise<boolean> => {
    await db.products.delete({ where: { id: id } })
    return true
}

// --------------------------------------------------
type ArgsProductType = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    description?: string,
    photo?: string,
}

type ArgsStockType = {
    id?: string,
    money_purchase?: number,
    money_selling?: number,
    quantity?: number,
    quantity_critical?: number,
    date_production?: string,
    date_expiration?: string,
}