import { db_role } from "./db_role"
import { db_user } from "./db_user"

export const db_init = async () => {
    console.log(" +++++ initDB +++++")
    const admin = 'admin'
    // --------------------------------------------------
    try {
        // create admin role if not exist
        await db_role.createRole(admin)
        // create operation if not exist
        for (let i = 0; i < db_role.listOperationName.length; i++)
            await db_role.createOperation(db_role.listOperationName[i])
        // create admin user if not exist
        await db_user.create({ id: admin, password: admin, roleId: admin })
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