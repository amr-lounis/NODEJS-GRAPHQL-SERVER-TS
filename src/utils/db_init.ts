
import { faker } from "@faker-js/faker"
import { authorization_matrix } from "./authorization_matrix"
import { myLog } from "./log"
import { db } from "./db"
import { getImageAsBase64 } from "./files"
import { operation_create, role_create, todoPhoto_set, todo_create, user_create } from "../gql"

export const db_init = async (listOperationName: string[]) => {
    myLog(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'
    // -------------------------------------------------- create all operations
    for (let i = 0; i < listOperationName.length; i++)

        try { await operation_create(listOperationName[i]) } catch (err) { }
    // -------------------------------------------------- create all roles
    try {
        await role_create(admin)
        await role_create(employee)
    } catch (err) { }
    // -------------------------------------------------- create all users
    try {
        await user_create({ id: admin, password: admin, roleId: admin })
        await user_create({ id: employee, password: employee, roleId: employee })
    } catch (err) { }
    // -------------------------------------------------- init autorisation matrix
    try {
        // init matrix roles
        await authorization_matrix.initMatrix()
        // admin set allow for all operation
        if (authorization_matrix.matrix.hasOwnProperty(admin)) {
            const operationIds = Object.keys(authorization_matrix?.matrix[admin]);
            for (const OperationId of operationIds) {
                authorization_matrix.matrix[admin][OperationId] = true;
            }
        }
        // stor matrix in database
        await authorization_matrix.storeMatrix()
    } catch (err) {
        myLog(err.message)
    }
    // -------------------------------------------------- init todo
    try {
        for (let i = 0; i < 100; i++) {
            const l = await (await db.todos.aggregate({ _count: { id: true } }))._count.id
            if (l < 100) {
                const money_required = faker.number.int({ min: 0, max: 100 })
                const money_expenses = faker.number.int({ min: 0, max: money_required })
                const money_paid = faker.number.int({ min: 0, max: money_required })
                const r = await todo_create({
                    employeeId: Math.random() > 0.5 ? 'admin' : 'employee',
                    agentId: Math.random() > 0.5 ? 'admin' : 'employee',
                    validation: Math.random() > 0.5 ? 'new' : 'complited',
                    description: faker.lorem.sentence({ min: 5, max: 10 }),
                    money_required: money_required,
                    money_expenses: money_expenses,
                    money_paid: money_paid,
                })
                todoPhoto_set(r.id, await getImageAsBase64(faker.image.avatar()))
            }
        }
    } catch (error) { }
}