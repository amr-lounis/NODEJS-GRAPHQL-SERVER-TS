import { TransactionType, db, myLog, toPage } from '../../utils';
// **************************************************************************************************** products
export const products_get = async (args: ArgsProductQ) => {
    args.filter_id = args.filter_id ?? ""
    return await db.$transaction(async (tr) => {
        const itemsCountAll = (await tr.products.aggregate({
            _count: { id: true },
            where: {
                id: { contains: args.filter_id, equals: args.id },
                categorieId: args.categorieId,
                unityId: args.unityId,
                code: args.code,
                createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
                description: { contains: args.filter_description },
                quantity: { gte: args.filter_quntity_gte, lte: args.filter_quntity_lte },
                date_alert: { gte: args.filter_date_alert_gte, lte: args.filter_date_alert_lte },
            }
        }))._count.id
        const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
        const items = await tr.products.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                id: { contains: args.filter_id, equals: args.id },
                categorieId: args.categorieId,
                unityId: args.unityId,
                code: args.code,
                createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
                description: { contains: args.filter_description },
                quantity: { gte: args.filter_quntity_gte, lte: args.filter_quntity_lte },
                date_alert: { gte: args.filter_date_alert_gte, lte: args.filter_date_alert_lte },
            },
            skip: p.itemsSkip, take: p.itemsTake
        });
        return {
            allItemsCount: itemsCountAll,
            allPagesCount: p.allPagesCount,
            itemsSkip: p.itemsSkip,
            itemsTake: p.itemsTake,
            pageNumber: p.pageNumber,
            itemsCount: items.length,
            items: items
        }
    })
}
export const product_photo_get = async (producId: string): Promise<string> => {
    const p = await db.p_photos.findUnique({ where: { productId: producId } });
    if (!p) throw new Error(`producId:${producId} not exist`);
    return p?.photo?.toString() ?? ""
}
export const product_create = async (args: ArgsProductType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('product id is required');
    if (args.money_purchase < 0) throw new Error('money_purchase < 0');
    if (args.money_selling < 0) throw new Error('money_selling < 0');
    if (args.money_selling_gr < 0) throw new Error('money_selling_gr < 0');
    if (args.quantity < 0) throw new Error("quantity < 0)");

    await db.$transaction(async (t) => {
        const r = await t.products.create({
            data: {
                id: args.id,
                categorieId: args.categorieId,
                unityId: args.unityId,
                code: args.code,
                description: args.description,
                money_purchase: args.money_purchase,
                money_selling: args.money_selling,
                money_selling_gr: args.money_selling_gr,
                date_alert: args.date_alert,
                quantity_alert: args.quantity_alert,
                quantity: args.quantity,
            }
        })
        await t.p_photos.create({
            data: { productId: r.id, photo: Buffer.from("", 'utf8') }
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
    if (id == undefined) throw new Error('product id is required');
    if (args.money_purchase < 0) throw new Error('money_purchase < 0');
    if (args.money_selling < 0) throw new Error('money_selling < 0');
    if (args.money_selling_gr < 0) throw new Error('money_selling_gr < 0');
    if (args.quantity < 0) throw new Error("quantity < 0)");

    await db.$transaction(async (t) => {
        const exist_p = await t.products.findFirst({ select: { id: true }, where: { id: id } }) ? true : false;
        if (!exist_p) throw new Error(`product id:${id} is not exist`);
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
                money_purchase: args.money_purchase,
                money_selling: args.money_selling,
                money_selling_gr: args.money_selling_gr,
                date_alert: args.date_alert,
                quantity_alert: args.quantity_alert,
                quantity: args.quantity,
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
export const product_delete = async (id: string): Promise<boolean> => {
    await db.products.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** units
export const product_units_get = async (): Promise<string[]> => {
    const r = await db.p_units.findMany({});
    return r.map((x) => x.id)
}
export const product_unity_create = async (id: string): Promise<boolean> => {
    await db.p_units.create({ data: { id: id } })
    return true
}
export const product_unity_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.p_units.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const product_unity_delete = async (id: string): Promise<boolean> => {
    await db.p_units.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** categories
export const product_categories_get = async (): Promise<string[]> => {
    const r = await db.p_categories.findMany({});
    return r.map((x) => x.id)
}
export const product_categorie_create = async (id: string): Promise<boolean> => {
    await db.p_categories.create({ data: { id: id } })
    return true
}
export const product_categorie_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.p_categories.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const product_categorie_delete = async (id: string): Promise<boolean> => {
    await db.p_categories.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** 
export type ArgsProductType = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    description?: string,
    photo?: string,
    // 
    money_purchase?: number,
    money_selling?: number,
    money_selling_gr?: number,
    date_alert?: string,
    quantity_alert?: number,
    quantity?: number,
}
// **************************************************************************************************** 
export type ArgsProductQ = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    // 
    filter_id: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    filter_quntity_gte?: number,
    filter_quntity_lte?: number,
    filter_date_alert_gte?: string,
    filter_date_alert_lte?: string,
    // 
    pageNumber?: number,
    itemsTake?: number
}
// **************************************************************************************************** 