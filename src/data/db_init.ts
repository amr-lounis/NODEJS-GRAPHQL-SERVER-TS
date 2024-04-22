import { db_role } from "./db_role"
import { db_user } from "./db_user"

export const db_init = async () => {
    console.log(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'
    // --------------------------------------------------
    try {
        await db_role.role_create(admin)
        await db_role.role_create(employee)
    } catch (err) { }
    // --------------------------------------------------

    for (let i = 0; i < db_role.listOperationName.length; i++)
        try { await db_role.operation_create(db_role.listOperationName[i]) } catch (err) { }
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
        console.log(err.message)
    }
    // --------------------------------------------------
}