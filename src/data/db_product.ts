import { db } from './db';

class product_controller {
    async gets() {
        return await db.products.findMany({});
    }
    async get(id: string) {
        return await db.products.findUnique({
            where: {
                id: id
            }
        })
    }
    async create(data: any) {
        await db.products.create({
            data: data
        })
    }
    async update(id: string, data: any) {
        await db.products.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async delete(id: string) {
        await db.products.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async getUnits() {
        return await db.p_units.findMany({});
    }
    async createUnity(data: any) {
        await db.p_units.create({
            data: data
        })
    }
    async updateUnity(id: string, data: any) {
        await db.p_units.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async deleteUnity(id: string) {
        await db.p_units.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async getCategories() {
        return await db.p_categories.findMany({});
    }
    async createCategorie(data: any) {
        await db.p_categories.create({
            data: data
        })
    }
    async updateCategorie(id: string, data: any) {
        await db.p_categories.update({
            where: {
                id: id
            },
            data: data
        })
    }
    async deleteCategorie(id: string) {
        await db.p_categories.delete({
            where: {
                id: id
            }
        })
    }
    // ****************************************************************************************************
    async getPhoto(producId: string) {
        const p = await db.p_photos.findFirst({ where: { producId: producId } },);
        return { ...p, photo: p?.photo?.toString() ?? "" }
    }
    async setPhoto(producId: string, photo: string) {
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