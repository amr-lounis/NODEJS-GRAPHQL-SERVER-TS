import { TransactionType, db, toPage } from '../../utils';
// **************************************************************************************************** products
export const products_get = async (args: ArgsProductQ) => {
    args.filter_id = args.filter_id ?? ""
    const itemsCountAll = (await db.products.aggregate({
        _count: { id: true }, where: {
            OR: [{ id: args.id }, { id: { contains: args.filter_id } },],
            categorieId: args.categorieId,
            unityId: args.unityId,
            code: args.code,
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await db.products.findMany({
        orderBy: { createdAt: 'desc' }, where: {
            OR: [{ id: args.id }, { id: { contains: args.filter_id } },],
            categorieId: args.categorieId,
            unityId: args.unityId,
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
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
}
export const product_photo_get = async (producId: string): Promise<string> => {
    const p = await db.p_photos.findUnique({ where: { productId: producId } },);
    return p?.photo?.toString() ?? ""
}
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
    if (id == undefined) throw new Error('error : id is required');
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
export const product_delete = async (id: string): Promise<boolean> => {
    await db.products.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** units
export const units_get = async () => {
    return await db.p_units.findMany({});
}
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
// **************************************************************************************************** categories
export const categories_get = async () => {
    return await db.p_categories.findMany({});
}
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
// **************************************************************************************************** product_stock
export const product_stock_set = async (tr: TransactionType, args: ArgsStockType): Promise<boolean> => {
    if (args.id == undefined) throw new Error('error : productId is required');
    if (args.money_purchase < 0) throw new Error('error : money_purchase < 0');
    if (args.money_selling < 0) throw new Error('error : money_selling < 0');
    if (args.quantity < 0) throw new Error("error : quantity < 0)");

    const exist_p = await tr.products.findFirst({ select: { id: true }, where: { id: args.id } }) ? true : false;
    if (!exist_p) throw new Error(`error : product id : ${args.id} is not exist`);
    await tr.p_stocks.update({
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

    return true
}
export const product_stock_quantity_updown = async (tr: TransactionType, id: string, quantity: number): Promise<boolean> => {//if  (quantity < 0) reduire else add
    const r = await tr.p_stocks.findUnique({ select: { quantity: true }, where: { productId: id } })
    if ((r.quantity + quantity) < 0) throw new Error("error : quantity");
    await product_stock_set(tr, { id: id, quantity: r.quantity + quantity })
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
}
// **************************************************************************************************** 
export type ArgsStockType = {
    id?: string,
    money_purchase?: number,
    money_selling?: number,
    quantity?: number,
    quantity_critical?: number,
    date_production?: string,
    date_expiration?: string,
}
// **************************************************************************************************** 
export type ArgsProductQ = {
    id?: string,
    categorieId?: string,
    unityId?: string,
    code?: string,
    filter_id: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    pageNumber?: number,
    itemsTake?: number,
    itemsSkip?: number,
}
// **************************************************************************************************** 