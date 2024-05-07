
import { faker } from "@faker-js/faker"
import { authorization_matrix } from "./authorization_matrix"
import { db } from "./db"
import { operation_create, role_create, todo_create, user_create } from "../gql"
import { myLog } from "./myFunc"

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
    } catch (error) { }
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
    } catch (err) { }
    // -------------------------------------------------- init todo
    try {
        const l_t = await (await db.todos.aggregate({ _count: { id: true } }))._count.id
        if (l_t < 10) for (let i = 0; i < 10; i++) {
            const money_total = faker.number.int({ min: 0, max: 100 })
            const money_expenses = faker.number.int({ min: 0, max: money_total })
            const money_paid = faker.number.int({ min: 0, max: money_total })
            const r = await todo_create({
                employeeId: Math.random() > 0.5 ? 'admin' : 'employee',
                dealerId: Math.random() > 0.5 ? 'admin' : 'employee',
                validation: Math.random() > 0.5 ? false : true,
                description: faker.lorem.sentence({ min: 5, max: 10 }),
                money_total: money_total,
                money_expenses: money_expenses,
                money_paid: money_paid,
                photo: faker.image.dataUri({ type: "svg-base64" })
            })
        }
    } catch (error) { }
    // -------------------------------------------------- init product
    try {
        const l_u = (await db.p_units.aggregate({ _count: { id: true } }))._count.id
        if (l_u < 10) for (let i = 0; i < 10; i++) await db.p_units.create({ data: { id: `unity_${i}` } })
        // 
        const l_c = (await db.p_categories.aggregate({ _count: { id: true } }))._count.id
        if (l_c < 10) for (let i = 0; i < 10; i++) await db.p_categories.create({ data: { id: `categorie_${i}` } })
        // 
        const l_p = (await db.products.aggregate({ _count: { id: true } }))._count.id
        if (l_p < 10) for (let i = 0; i < 10; i++) await db.products.create({ data: { id: `product_${i}` } })
        // 
    } catch (error) { }
    // -------------------------------------------------- init invoice
    try {
        const l_u = (await db.p_units.aggregate({ _count: { id: true } }))._count.id
        if (l_u < 10) for (let i = 0; i < 10; i++) await db.p_units.create({ data: { id: `unity_${i}` } })
        // 
        const l_c = (await db.p_categories.aggregate({ _count: { id: true } }))._count.id
        if (l_c < 10) for (let i = 0; i < 10; i++) await db.p_categories.create({ data: { id: `categorie_${i}` } })
        // 
        const l_p = (await db.products.aggregate({ _count: { id: true } }))._count.id
        if (l_p < 10) for (let i = 0; i < 10; i++) await db.products.create({ data: { id: `product_${i}` } })
        // 
    } catch (error) { }
}