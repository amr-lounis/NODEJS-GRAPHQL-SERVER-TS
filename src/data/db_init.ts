import { myLog } from "../utils"
import { db_role } from "./db_role"
import { db_todo } from "./db_todo"
import { db_user } from "./db_user"
import { faker } from '@faker-js/faker';

export const db_init = async (listOperationName: string[]) => {
    myLog(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'
    // --------------------------------------------------
    for (let i = 0; i < listOperationName.length; i++)
        try { await db_role.operation_create(listOperationName[i]) } catch (err) { }
    // --------------------------------------------------
    try {
        await db_role.role_create(admin)
        await db_role.role_create(employee)
    } catch (err) { }
    // --------------------------------------------------
    try {
        await db_user.user_create({ id: admin, password: admin, roleId: admin })
        await db_user.user_create({ id: employee, password: employee, roleId: employee })
    } catch (err) { }
    // --------------------------------------------------
    try {
        // init matrix roles
        await db_role.initMatrix()
        // admin set allow for all operation
        if (db_role.matrix.hasOwnProperty(admin)) {
            const operationIds = Object.keys(db_role?.matrix[admin]);
            for (const OperationId of operationIds) {
                db_role.matrix[admin][OperationId] = true;
            }
        }
        // stor matrix in database
        await db_role.storeMatrix()
    } catch (err) {
        myLog(err.message)
    }
}