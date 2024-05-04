import { extendType, floatArg, intArg, nonNull, nullable, objectType, stringArg } from 'nexus';
import { db, toPage } from '../../utils';
// **************************************************************************************************** 
export const ProductQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('products_get', {
            args: {
                id: nullable(stringArg()),
                employeeId: nullable(stringArg()),
                dealerId: nullable(stringArg()),
                validation: nullable(stringArg()),
                filter_description: nullable(stringArg()),
                filter_create_gte: nullable(stringArg()),
                filter_create_lte: nullable(stringArg()),
                pageNumber: nullable(intArg()),
                itemsTake: nullable(intArg()),
                money_unpaid_gte: nullable(floatArg()),
                money_unpaid_lte: nullable(floatArg()),
            },
            description: "date format : 2000-01-01T00:00:00Z",
            type: products_get_out,
            resolve: async (parent, args: ArgsProductQ, context, info) => {
                return products_get(args)
            },
        });
        t.field('product_photo_get', {
            args: { id: nonNull(stringArg()) },
            type: nonNull('String'),
            async resolve(parent, args: { id?: string }, context, info) {
                return product_photo_get(args.id)
            },
        });
    }
});
// **************************************************************************************************** 
export const products_get = async (args: ArgsProductQ) => {
    // return await db.products.findMany({});
    const itemsCountAll = (await db.products.aggregate({
        _count: { id: true }, where: {
            id: args.id,
            categorieId: args.categorieId,
            unityId: args.unityId,
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await db.products.findMany({
        orderBy: { createdAt: 'desc' }, where: {
            id: args.id,
            categorieId: args.categorieId,
            unityId: args.unityId,
        },
        skip: p.itemsSkip, take: p.itemsTake
    })

    return {
        allItemsCount: itemsCountAll,
        allPagesCount: p.allPagesCount,
        itemsSkip: p.itemsSkip,
        itemsTake: p.itemsTake,
        pageNumber: p.pageNumber,
        itemsCount: items.length,
        items: items
    }
}
export const units_get = async () => {
    return await db.p_units.findMany({});
}
export const categories_get = async () => {
    return await db.p_categories.findMany({});
}
export const product_photo_get = async (producId: string): Promise<string> => {
    const p = await db.p_photos.findUnique({ where: { productId: producId } },);
    return p?.photo?.toString() ?? ""
}
// **************************************************************************************************** 
export const product_get_out = objectType({
    name: 'product_get_out',
    definition(t) {
        ["id", "categorieId", "unityId", "code", "description"].map((x) => t.nullable.string(x));
        ["createdAt", "updatedAt"].map((x) => t.nullable.float(x));
    },
});
export const products_get_out = objectType({
    name: 'products_get_out',
    definition(t) {
        t.nullable.int('allItemsCount')
        t.nullable.int('allPagesCount')
        t.nullable.int('pageNumber')
        t.nullable.int('itemsTake')
        t.nullable.int('itemsSkip')
        t.nullable.int('itemsCount')
        t.nullable.list.field('items', { type: 'product_get_out' })
    },
});
export type ArgsProductQ = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
}