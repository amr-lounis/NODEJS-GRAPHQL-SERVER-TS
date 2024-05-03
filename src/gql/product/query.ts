import { extendType, nonNull, stringArg } from 'nexus';
import { db } from '../../utils';
// **************************************************************************************************** 
export const ProductQuery = extendType({
    type: 'Query',
    definition(t) {
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
export const products_get = async () => {
    return await db.products.findMany({});
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