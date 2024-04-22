import { db } from './db';

class product_controller {
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
    async product_create(data: any) {
        await db.products.create({
            data: data
        })
    }
    async product_update(id: string, data: any) {
        await db.products.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async product_delete(id: string) {
        await db.products.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async units_get() {
        return await db.p_units.findMany({});
    }
    async unity_create(data: any) {
        await db.p_units.create({
            data: data
        })
    }
    async unity_update(id: string, data: any) {
        await db.p_units.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async unity_delete(id: string) {
        await db.p_units.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async categories_get() {
        return await db.p_categories.findMany({});
    }
    async categorie_create(data: any) {
        await db.p_categories.create({
            data: data
        })
    }
    async categorie_update(id: string, data: any) {
        await db.p_categories.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async categorie_delete(id: string) {
        await db.p_categories.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async stocks_get() {
        return await db.p_stocks.findMany({});
    }
    async stock_get(productId: string) {
        return await db.p_stocks.findUnique({
            where: {
                productId: productId
            }
        })
    }
    async stock_create(data: any) {
        await db.p_stocks.create({
            data: data
        })
    }
    async stock_update(productId: string, data: any) {
        await db.p_stocks.update({
            where: {
                productId: productId
            },
            data: data
        })
    }
    async stock_delete(productId: string) {
        await db.p_stocks.delete({
            where: {
                productId: productId
            }
        })
    }
    // ****************************************************************************************************
    async Photo_get(producId: string) {
        const p = await db.p_photos.findFirst({ where: { producId: producId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async Photo_set(producId: string, photo: string) {
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
    // **************************************************************************************************** 
}

export const db_product = new product_controller()