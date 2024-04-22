import { db } from './db';

interface Role {
    id: string;
}

interface Operation {
    id: string;
}

interface Matrix {
    [roleId: string]: {
        [operationId: string]: boolean;
    };
}

class role_controller {
    matrix: Matrix = {};
    async roles_get(): Promise<String[]> {
        const r = await db.u_roles.findMany({ select: { id: true } });
        return r.map((x) => x.id)
    }
    async role_create(id: string): Promise<String> {
        await db.u_roles.create({ data: { id: id } })
        return "ok"
    }
    async role_update(id: string, idNew: string): Promise<String> {
        await db.u_roles.update({ where: { id: id }, data: { id: idNew } })
        return "ok"
    }
    async role_delete(id: string): Promise<String> {
        await db.u_roles.delete({ where: { id: id } })
        return "ok"
    }
    // **************************************************************************************************** 
    async operations_get(): Promise<String[]> {
        const r = await db.u_operations.findMany({});
        return r.map((x) => x.id)
    }
    async operation_create(id: string): Promise<String> {
        await db.u_operations.create({ data: { id: id } })
        return "ok"
    }
    async operation_update(id: string, idNew: string): Promise<String> {
        await db.u_operations.update({ where: { id: id }, data: { id: idNew } })
        return "ok"
    }
    async operation_delete(id: string): Promise<String> {
        await db.u_operations.delete({ where: { id: id } })
        return "ok"
    }
    // **************************************************************************************************** 
    async authorizations_get(roleId: string) {
        return await db.u_roles_operations.findMany({ where: { roleId: roleId } })
    }
    async authorization_set(roleId: string, operationId: string, value: boolean): Promise<String> {
        const exist = await db.u_roles_operations.findFirst({ where: { operationId: operationId, roleId: roleId } }) ? true : false
        if (!exist) {
            await db.u_roles_operations.create({
                data: {
                    operationId: operationId,
                    roleId: roleId,
                    value: value
                },
            })
            return "ok"
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
            return "ok"
        }

    }
    async authorization_delete(roleId: string, operationId: string): Promise<String> {
        await db.u_roles_operations.deleteMany({ where: { operationId: operationId, roleId: roleId } })
        return "ok"
    }
    // **************************************************************************************************** 
    authorization_get(role: string, operationName: string): boolean {
        if (operationName == 'user_signin') return true;
        if (this.matrix.hasOwnProperty(role) && this.matrix[role].hasOwnProperty(operationName)) {
            return this.matrix[role][operationName];
        } else {
            // Return false if the role or operation doesn't exist in the matrix
            return false;
        }
    }
    async initMatrix() {
        // get roles from database
        const roles = await db.u_roles.findMany();
        // get operations from database
        const operations = await db.u_operations.findMany();
        const matrix: Matrix = {};

        roles.forEach((role: Role) => {
            matrix[role.id] = {};
            operations.forEach((operation: Operation) => {
                matrix[role.id][operation.id] = false;
            });
        });

        const roleoperations = await db.u_roles_operations.findMany({
            include: {
                role: true,
                operation: true,
            },
        });

        roleoperations.forEach((roleoperation) => {
            const roleId = roleoperation.roleId;
            const operationId = roleoperation.operationId;
            matrix[roleId][operationId] = roleoperation.value;
        });
        this.matrix = matrix;
    }
    // **************************************************************************************************** 
    async storeMatrix() {
        const roleIds = Object.keys(this.matrix);
        for (const roleId of roleIds) {
            const operationIds = Object.keys(this.matrix[roleId]);
            for (const operationId of operationIds) {
                const value = this.matrix[roleId][operationId];
                await this.authorization_set(roleId, operationId, value)
            }
        }
    }
}

export const db_role = new role_controller();