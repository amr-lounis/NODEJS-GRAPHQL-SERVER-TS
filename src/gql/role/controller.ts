import { authorization_matrix, db } from '../../utils';
// **************************************************************************************************** operation
export const operations_get = async (): Promise<string[]> => {
    const r = await db.u_operations.findMany({});
    return r.map((x) => x.id)
}
export const operation_create = async (id: string): Promise<boolean> => {
    await db.u_operations.create({ data: { id: id } })
    return true
}
export const operation_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.u_operations.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const operation_delete = async (id: string): Promise<boolean> => {
    await db.u_operations.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** role
export const roles_get = async (): Promise<string[]> => {
    const r = await db.u_roles.findMany({ select: { id: true } });
    return r.map((x) => x.id)
}
export const role_create = async (id: string): Promise<boolean> => {
    await db.u_roles.create({ data: { id: id } })
    return true
}
export const role_update = async (id: string, idNew: string): Promise<boolean> => {
    await db.u_roles.update({ where: { id: id }, data: { id: idNew } })
    return true
}
export const role_delete = async (id: string): Promise<boolean> => {
    await db.u_roles.delete({ where: { id: id } })
    return true
}
// **************************************************************************************************** role_authorization
export const authorizations_get = async (roleId: string) => {
    return await db.u_roles_operations.findMany({ where: { roleId: roleId } })
}
export const authorizations_all_get = async () => {
    return await db.u_roles_operations.findMany({})
}
export const role_authorization_set = async (roleId: string, operationId: string, value: boolean): Promise<boolean> => {
    const exist = await db.u_roles_operations.findFirst({ where: { operationId: operationId, roleId: roleId } }) ? true : false
    if (!exist) {
        await db.u_roles_operations.create({
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    else {
        await db.u_roles_operations.updateMany({
            where: {
                operationId: operationId,
                roleId: roleId
            },
            data: {
                operationId: operationId,
                roleId: roleId,
                value: value
            },
        })
    }
    return true;
}
// **************************************************************************************************** 