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
    listOperationName: string[] = []

    async createRole(id: string) {
        return await db.u_roles.create({ data: { id: id } })
    }

    async deleteRole(id: string) {
        return await db.u_roles.delete({ where: { id: id } })
    }
    // 
    async createOperation(id: string) {
        return await db.u_operations.create({ data: { id: id } })
    }
    async deleteOperation(id: string) {
        return await db.u_operations.delete({ where: { id: id } })
    }
    // 
    async setRoleOperation(roleId: string, operationId: string, value: boolean) {
        const exist = await db.u_roles_operations.findFirst({ where: { operationId: operationId, roleId: roleId } }) ? true : false
        if (!exist) {
            return await db.u_roles_operations.create({
                data: {
                    operationId: operationId,
                    roleId: roleId,
                    value: value
                },
            })
        }
        else {
            return await db.u_roles_operations.updateMany({
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
    }
    // 
    async initMatrix() {
        const roles = await db.u_roles.findMany();
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

    async storeMatrix() {
        const roleIds = Object.keys(this.matrix);
        for (const roleId of roleIds) {
            const operationIds = Object.keys(this.matrix[roleId]);
            for (const operationId of operationIds) {
                const value = this.matrix[roleId][operationId];
                await this.setRoleOperation(roleId, operationId, value)
            }
        }
    }

    getAuthorization(role: string, operationName: string): boolean {
        if (operationName == 'user_signin') return true;
        if (this.matrix.hasOwnProperty(role) && this.matrix[role].hasOwnProperty(operationName)) {
            return this.matrix[role][operationName];
        } else {
            // Return false if the role or operation doesn't exist in the matrix
            return false;
        }
    }
}

export const db_role = new role_controller();