import { db } from "./db";

interface Matrix {
    [roleId: string]: {
        [operationId: string]: boolean;
    };
}

class authorization_matrix_controller {
    matrix: Matrix = {};
    // --------------------------------------------------
    async initMatrix() {
        const matrix: Matrix = {};
        // get roles from database
        const roles = await this.roles_get()
        // get operations from database
        const operations = await this.operations_get()

        roles.forEach((role: string) => {
            matrix[role] = {};
            operations.forEach((operation: string) => {
                matrix[role][operation] = false;
            });
        });

        const roleoperations = await db.u_roles_operations.findMany({});

        roleoperations.forEach((roleoperation) => {
            const roleId = roleoperation.roleId;
            const operationId = roleoperation.operationId;
            matrix[roleId][operationId] = roleoperation.value;
        });
        this.matrix = matrix;
    }
    // --------------------------------------------------
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
    // --------------------------------------------------
    authorization_test(role: string, operationName: string): boolean {
        if (operationName == 'user_authentication') return true;
        if (this.matrix.hasOwnProperty(role) && this.matrix[role].hasOwnProperty(operationName)) {
            return this.matrix[role][operationName];
        } else {
            // Return false if the role or operation doesn't exist in the matrix
            return false;
        }
    }
    // --------------------------------------------------
    async authorizations_get(roleId: string) {
        return await db.u_roles_operations.findMany({ where: { roleId: roleId } })
    }
    async authorization_set(roleId: string, operationId: string, value: boolean): Promise<boolean> {
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
    // --------------------------------------------------
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
    // --------------------------------------------------
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
    // --------------------------------------------------
}

export const authorization_matrix = new authorization_matrix_controller();