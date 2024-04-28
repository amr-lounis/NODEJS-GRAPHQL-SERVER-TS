import { authorization_set, authorizations_all_get, operations_get, roles_get } from "../gql";
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
        const roles = await roles_get()
        // get operations from database
        const operations = await operations_get()

        roles.forEach((role: string) => {
            matrix[role] = {};
            operations.forEach((operation: string) => {
                matrix[role][operation] = false;
            });
        });

        const roleoperations = await authorizations_all_get()

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
                await authorization_set(roleId, operationId, value)
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
}

export const authorization_matrix = new authorization_matrix_controller();