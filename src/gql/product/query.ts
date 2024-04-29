import { extendType, list, nonNull, stringArg } from 'nexus';
import { db } from '../../utils';
// **************************************************************************************************** 
export const ProductQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('products_get', {
            args: {},
            type: nonNull('String'),
            async resolve(parent, args, context, info) {

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
export const stocks_get = async () => {
    return await db.p_stocks.findMany({});
}
export const productPhoto_get = async (producId: string) => {
    const p = await db.p_photos.findFirst({ where: { producId: producId } },);
    return { ...p, photo: p?.photo?.toString() ?? "" }
}
// **************************************************************************************************** 