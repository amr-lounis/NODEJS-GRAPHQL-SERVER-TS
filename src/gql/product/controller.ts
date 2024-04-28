import { db } from '../../utils/db';

class product_controller {
    // **************************************************************************************************** Q
    async products_get() {
        return await db.products.findMany({});
    }
    async product_get(id: string) {
        return await db.products.findUnique({
            where: {
                id: id
            }
        })
    }
    async units_get() {
        return await db.p_units.findMany({});
    }
    async categories_get() {
        return await db.p_categories.findMany({});
    }
    async stocks_get() {
        return await db.p_stocks.findMany({});
    }
    async stock_get(productId: string) {
        return await db.p_stocks.findUnique({ where: { productId: productId } })
    }
    async productPhoto_get(producId: string) {
        const p = await db.p_photos.findFirst({ where: { producId: producId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    // **************************************************************************************************** M
    async unity_create(id: string) {
        await db.p_units.create({ data: { id: id } })
    }
    async categorie_create(id: string) {
        await db.p_categories.create({ data: { id: id } })
    }
    // 
    async unity_update(id: string, idNew: string) {
        await db.p_units.update({ where: { id: id }, data: { id: idNew } })
    }
    async categorie_update(id: string, idNew: string) {
        await db.p_categories.update({ where: { id: id }, data: { id: idNew } })
    }
    async productPhoto_set(producId: string, photo: string) {
        if (photo.length > 524288) return new Error("The size is greater than the maximum value");
        const photpBytes = Buffer.from(photo ?? "", 'utf8')
        // 
        const exist = await db.p_photos.findFirst({ select: { producId: true }, where: { producId: producId } }) ? true : false
        if (!await exist) {
            const p = await db.p_photos.create({ data: { producId: producId, photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
        else {
            const p = await db.p_photos.update({ where: { producId: producId }, data: { photo: photpBytes } },);
            return { ...p, photo: p?.photo?.toString() ?? "" }
        }
    }
    // 
    async product_delete(id: string) {
        await db.products.delete({ where: { id: id } })
    }
    async unity_delete(id: string) {
        await db.p_units.delete({ where: { id: id } })
    }
    async categorie_delete(id: string) {
        await db.p_categories.delete({ where: { id: id } })
    }
    async stock_delete(productId: string) {
        await db.p_stocks.delete({ where: { productId: productId } })
    }

    // **************************************************************************************************** 
}

export const db_product = new product_controller()