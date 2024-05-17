
import { faker } from "@faker-js/faker"
import { authorization_matrix } from "./authorization_matrix"
import { product_categorie_create, operation_create, product_create, role_create, todo_create, product_unity_create, user_create, setting_set, invoice_create, invoice_types, invoice_update_prudect, invoice_update, invoiceGetOrError } from "../gql"
import { myLog, randomString } from "./myFunc"
import { product_quantity_updown } from "../gql"
import { db } from "./db"

export const db_init = async (listOperationName: string[]) => {
    myLog(" +++++ initDB +++++")
    const admin = 'admin'
    const employee = 'employee'
    // -------------------------------------------------- create all operations
    for (let i = 0; i < listOperationName.length; i++)
        try {
            await db.$transaction(async (t) => {
                await operation_create(t, listOperationName[i])
            })
        } catch (err) { }
    // -------------------------------------------------- create all roles
    try {
        await db.$transaction(async (t) => {
            await role_create(t, admin)
            await role_create(t, employee)
        })
    } catch (err) { }
    // -------------------------------------------------- create all users
    try {
        await db.$transaction(async (t) => {
            await user_create(t, {
                id: admin,
                password: admin,
                roleId: admin,
                photo: generat_photo()
            })
            await user_create(t, {
                id: employee,
                password: employee,
                roleId: employee,
                photo: generat_photo()
            })
        })
    } catch (err) { }
    // -------------------------------------------------- init autorisation matrix
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
    // -------------------------------------------------- init todo
    try {
        await db.$transaction(async (t) => {
            let size = 0;
            while (size <= 10) {
                size = (await db.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0
                const money_total = faker.number.int({ min: 0, max: 100 })
                const money_expenses = faker.number.int({ min: 0, max: money_total })
                const money_paid = faker.number.int({ min: 0, max: money_total })

                const r = await todo_create(t, {
                    employeeId: Math.random() > 0.5 ? 'admin' : 'employee',
                    dealerId: Math.random() > 0.5 ? 'admin' : 'employee',
                    description: faker.lorem.sentence({ min: 5, max: 10 }),
                    money_total: money_total,
                    money_expenses: money_expenses,
                    money_paid: money_paid,
                    photo: generat_photo()
                })
            }
        })
    } catch (err) { }
    // -------------------------------------------------- init product
    try {
        await db.$transaction(async (t) => {
            let size = 0;
            let i = 0;
            while (size < 10) {
                size = (await db.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0
                if (size >= 10) break;
                const p = `product_${i}`
                const u = `unity_${i}`
                const c = `categorie_${i}`
                const money_purchase = faker.number.int({ min: 0, max: 100 })
                const money_selling = faker.number.int({ min: money_purchase, max: 1000 })
                const money_selling_gr = faker.number.int({ min: money_purchase, max: money_selling })
                // 
                await product_unity_create(t, u)
                await product_categorie_create(t, c)
                await product_create(t, {
                    id: p, unityId: u,
                    categorieId: c,
                    code: p,
                    description: p,
                    money_purchase: money_purchase,
                    money_selling: money_selling,
                    money_selling_gr: money_selling_gr,
                    quantity_alert: faker.number.int({ min: 0, max: 10 }),
                    photo: generat_photo()
                })
                i++;
            }
        })
    } catch (err) { }
    // -------------------------------------------------- init setting
    try {
        await db.$transaction(async (t) => {
            let size = 0;
            while (size < 10) {
                size = (await db.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0
                if (size >= 10) break;
                await setting_set(t, faker.string.uuid(), faker.string.uuid())
            }
        })
    } catch (err) { }
    // -------------------------------------------------- init invoice
    try {
        let size = 0;
        while (size < 10) {
            size = (await db.invoices.aggregate({ _count: { id: true } }))._count.id ?? 0
            if (size >= 10) break;
            await db.$transaction(async (t) => {
                const invoiceId = await invoice_create(t, invoice_types.PURCHASE, "admin")
                // add products
                for (let j = 0; j < 10; j++) {
                    await invoice_update_prudect(t, {
                        invoiceId: invoiceId,
                        prudectId: `product_${j}`,
                        quantity: faker.number.int({ min: 1, max: 10 }),
                        description: faker.lorem.sentence({ min: 5, max: 10 }),
                    })
                }
                await invoice_update(t, invoiceId, {
                    dealerId: Math.random() > 0.5 ? 'admin' : 'employee',
                    description: faker.lorem.sentence({ min: 5, max: 10 }),
                    money_stamp: faker.number.int({ min: 0, max: 100 }),
                    money_tax: faker.number.int({ min: 0, max: 100 }),
                })
                const iii = await t.invoices.findUnique({ where: { id: invoiceId } })
                await invoice_update(t, invoiceId, { money_paid: iii.money_calc })
            })
        }
    } catch (err) { myLog(err) }
}

const generat_photo = () => {
    return faker.image.dataUri({ type: "svg-base64" })
}