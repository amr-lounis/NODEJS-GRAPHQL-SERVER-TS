import { myLog } from "../utils"
import { db } from "./db";
import { db_role } from "./db_role"
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
        await db.users.create({ data: { id: admin, password: admin, roleId: admin } })
        await db.users.create({ data: { id: employee, password: employee, roleId: employee } })
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
    try {
        for (let i = 0; i < 100; i++) {
            const l = await (await db.todos.aggregate({ _count: { id: true } }))._count.id
            if (l < 100) {
                await db.todos.create({
                    data: {
                        employeeId: Math.random() > 0.5 ? 'admin' : 'employee',
                        agentId: Math.random() > 0.5 ? 'admin' : 'employee',
                        validation: Math.random() > 0.5 ? 'new' : 'complited',
                        description: faker.lorem.sentence({ min: 5, max: 10 }),
                        money_required: faker.number.int({ min: 5, max: 10 }),
                        money_paid: faker.number.int({ min: 5, max: 10 }),
                        money_unpaid: faker.number.int({ min: 5, max: 10 }),
                        money_expenses: faker.number.int({ min: 5, max: 10 }),
                        money_margin: faker.number.int({ min: 5, max: 10 }),
                        createdAt: faker.date.anytime(),
                        updatedAt: faker.date.anytime(),
                    }
                })
            }
        }
    } catch (error) { }
}