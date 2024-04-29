import { arg, extendType, nonNull, stringArg } from "nexus";
import { db } from "../../utils";

// **************************************************************************************************** 
export const ProductMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('product_unity_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: { id?: string }, context, info) {
                return unity_create(args.id)
            },
        });
        t.field('product_unity_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('String'),
            resolve(parent, args: { id?: string, idNew: string }, context, info) {
                return unity_update(args.id, args.idNew)
            },
        });
        t.field('product_unity_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: { id?: string }, context, info) {
                return unity_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('product_categorie_create', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: { id?: string }, context, info) {
                return categorie_create(args.id)
            },
        });
        t.field('product_categorie_update', {
            args: { id: nonNull(stringArg()), idNew: nonNull(stringArg()), },
            type: nonNull('String'),
            resolve(parent, args: { id?: string, idNew: string }, context, info) {
                return categorie_update(args.id, args.idNew)
            },
        });
        t.field('product_categorie_delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: { id?: string }, context, info) {
                return categorie_delete(args.id)
            },
        });
        // --------------------------------------------------
        t.field('product__create', {
            args: {
                id: nonNull(stringArg()),
                categorieId: nonNull(stringArg()),
                unityId: nonNull(stringArg()),
                code: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            type: nonNull('String'),
            resolve(parent, args: ArgsProductType, context, info) {
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
            },
            type: nonNull('String'),
            resolve(parent, args: ArgsProductType, context, info) {
                return product_update(args.id, args)
            },
        });
        t.field('product__id_update', {
            args: {
                id: nonNull(stringArg()),
                idNew: nonNull(stringArg()),
            },
            type: nonNull('String'),
            resolve(parent, args: { id: string, idNew: string }, context, info) {
                return product_update(args.id, { id: args.idNew })
            },
        });
        t.field('product__delete', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            resolve(parent, args: { id: string }, context, info) {
                return product_delete(args.id)
            },
        });
        // --------------------------------------------------
    }
});
// **************************************************************************************************** 
export const unity_create = async (id: string): Promise<String> => {
    await db.p_units.create({ data: { id: id } })
    return "ok"
}
export const unity_update = async (id: string, idNew: string): Promise<String> => {
    await db.p_units.update({ where: { id: id }, data: { id: idNew } })
    return "ok"
}
export const unity_delete = async (id: string): Promise<String> => {
    await db.p_units.delete({ where: { id: id } })
    return "ok"
}
// --------------------------------------------------
export const categorie_create = async (id: string): Promise<String> => {
    await db.p_categories.create({ data: { id: id } })
    return "ok"
}
export const categorie_update = async (id: string, idNew: string): Promise<String> => {
    await db.p_categories.update({ where: { id: id }, data: { id: idNew } })
    return "ok"
}
export const categorie_delete = async (id: string): Promise<String> => {
    await db.p_categories.delete({ where: { id: id } })
    return "ok"
}
// --------------------------------------------------
export const stock_delete = async (productId: string): Promise<String> => {
    await db.p_stocks.delete({ where: { productId: productId } })
    return "ok"
}
// --------------------------------------------------
type ArgsProductType = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    description?: string
}
export const product_create = async (args: ArgsProductType) => {
    await db.products.create({
        data: {
            id: args.id,
            categorieId: args.id,
            unityId: args.id,
            code: args.id,
            description: args.id
        }
    })
}
export const product_update = async (id: string, args: ArgsProductType) => {
    await db.products.update({
        where: {
            id: id
        },
        data: {
            id: args.id,
            categorieId: args.id,
            unityId: args.id,
            code: args.id,
            description: args.id
        }
    })
}
export const product_delete = async (id: string) => {
    await db.products.delete({ where: { id: id } })
}
export const productPhoto_set = async (id: string, photo: string): Promise<String> => {
    if (photo.length > 524288) throw new Error("The size is greater than the maximum value");
    const photpBytes = Buffer.from(photo ?? "", 'utf8')
    // 
    await db.$transaction(async (t) => {
        const exist = await t.p_photos.findFirst({ select: { producId: true }, where: { producId: id } }) ? true : false
        if (!exist) await t.p_photos.create({ data: { producId: id, photo: photpBytes } },);
        else await t.p_photos.update({ where: { producId: id }, data: { photo: photpBytes } },);
    })
    return "ok"
}
// --------------------------------------------------