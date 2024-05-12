import { MyToken, db, toPage } from "../../utils"
// **************************************************************************************************** 
export const user_authentication = async (id: string, password: string): Promise<string> => {
    try {
        var u = await db.users.findFirst({ where: { id: id, password: password } })
        return MyToken.Token_Create(u.id, u.roleId)
    } catch (error) {
        return ""
    }
}
export const user_authentication_renewal = async (id: string, roleId: string): Promise<string> => {
    try {
        return MyToken.Token_Create(id, roleId)
    } catch (error) {
        return ""
    }
}
export const user_role_get = async (id: string): Promise<string> => {
    const r = await db.users.findUnique({ where: { id: id } });
    if (!r) throw new Error('not exist');
    return r?.roleId
}
export const user_photo_get = async (id: string): Promise<string> => {
    const p = await db.u_photos.findUnique({ where: { userId: id } },);
    if (!p) throw new Error('not exist');
    return p?.photo?.toString() ?? ""
}

export const users_get = async (args: ArgsUserQ) => {
    args.filter_id = args.filter_id ?? ""
    const itemsCountAll = (await db.users.aggregate({
        _count: { id: true }, where: { // -------------------------------------------------- where for 1
            id: { contains: args.filter_id, equals: args.id },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }
    }))._count.id
    const p = toPage(itemsCountAll, args.pageNumber, args.itemsTake)
    const items = await db.users.findMany({
        orderBy: { createdAt: 'desc' }, where: {  // -------------------------------------------------- where for 2
            id: { contains: args.filter_id, equals: args.id },
            createdAt: { gte: args.filter_create_gte, lte: args.filter_create_lte },
            description: { contains: args.filter_description },
        }, skip: p.itemsSkip, take: p.itemsTake
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
export const user_create = async (args: ArgsUserM): Promise<boolean> => {
    if (args.id == undefined) throw new Error('id is required');
    if (args.id.length > 100) throw new Error('id length > 100');
    await db.$transaction(async (t) => {
        const r = await t.users.create({
            data: {
                id: args.id,
                password: args.password,
                description: args.description,
                roleId: args.roleId,
                address: args.address,
                first_name: args.first_name,
                last_name: args.last_name,
                phone: args.phone,
                fax: args.fax,
                email: args.email,
            }
        });
        await t.u_photos.create({
            data: { userId: r.id, photo: Buffer.from("", 'utf8') }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.u_photos.update({ where: { userId: r.id }, data: { photo: photpBytes } });
        }
    });
    return true;
}
export const user_update = async (id: string, args: ArgsUserM): Promise<boolean> => {
    if (id == undefined) throw new Error('id is required');
    if (args?.id?.length > 100) throw new Error('id length > 100');
    await db.$transaction(async (t) => {
        const exist_u = await t.users.findFirst({ select: { id: true }, where: { id: id } }) ? true : false;
        if (!exist_u) throw new Error(`error : user id : ${id} is not exist`);
        await t.users.update({
            where: { id: id },
            data: {
                id: args.id,
                password: args.password,
                description: args.description,
                roleId: args.roleId,
                address: args.address,
                first_name: args.first_name,
                last_name: args.last_name,
                phone: args.phone,
                fax: args.fax,
                email: args.email,
            }
        });
        if (args.photo != undefined) {
            if (args.photo.length > 524288) throw new Error("The size is greater than the maximum value");
            const photpBytes = Buffer.from(args.photo ?? "", 'utf8')
            await t.u_photos.update({ where: { userId: id }, data: { photo: photpBytes } });
        }
    }
    );
    return true;
}
export const user_delete = async (id: string): Promise<boolean> => {
    await db.users.delete({ where: { id: id } })
    return true;
}
// **************************************************************************************************** 
export type ArgsUserQ = {
    id?: string,
    userId?: string,
    password?: string,
    filter_id?: string,
    filter_description?: string,
    filter_create_gte?: string,
    filter_create_lte?: string,
    itemsTake?: number,
    itemsSkip?: number,
    pageNumber?: number,
}

export type ArgsUserM = {
    id?: string,
    roleId?: string,
    password?: string,
    description?: string,
    address?: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    fax?: string,
    email?: string,
    photo?: string,
}