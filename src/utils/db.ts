import { PrismaClient } from '@prisma/client';
import { myLog } from '.';
import { faker } from '@faker-js/faker';
import { authorization_matrix } from './authorization_matrix';

class Models {
    private static instance = new PrismaClient()
    public static getInstance = () => Models.instance;
    constructor() {
        myLog(" ----- PrismaClient init")
    }
}
export const db = Models.getInstance();


export const db_init = async (listOperationName: string[]) => {
    myLog(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'
    // -------------------------------------------------- create all operations
    for (let i = 0; i < listOperationName.length; i++)
        try { await db.u_operations.create({ data: { id: listOperationName[i] } }) } catch (err) { }
    // -------------------------------------------------- create all roles
    try {
        await db.u_roles.create({ data: { id: admin } })
        await db.u_roles.create({ data: { id: employee } })
    } catch (err) { }
    // -------------------------------------------------- create all users
    try {
        await db.users.create({ data: { id: admin, password: admin, roleId: admin } })
        await db.users.create({ data: { id: employee, password: employee, roleId: employee } })
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