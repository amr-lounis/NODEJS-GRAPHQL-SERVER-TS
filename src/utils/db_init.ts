
import { faker } from "@faker-js/faker"
import { authorization_matrix } from "./authorization_matrix"
import { db } from "./db"
import { product_categorie_create, operation_create, product_create, role_create, todo_create, product_unity_create, user_create, setting_set } from "../gql"
import { myLog } from "./myFunc"
import { product_quantity_updown } from "../gql"

export const db_init = async (listOperationName: string[]) => {
    db.$transaction(async (t) => {
        try {
            myLog(" +++++ initDB +++++")
            const admin = 'admin'
            const employee = 'employee'
            // -------------------------------------------------- create all operations
            for (let i = 0; i < listOperationName.length; i++)
                try { await operation_create(t, listOperationName[i]) } catch (err) { }
            // -------------------------------------------------- create all roles
            try {
                await role_create(t, admin)
                await role_create(t, employee)
            } catch (err) { }
            // -------------------------------------------------- create all users
            await user_create({
                id: admin,
                password: admin,
                roleId: admin,
                photo: generat_photo()
            })
            await user_create({
                id: employee,
                password: employee,
                roleId: employee,
                photo: generat_photo()
            })
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
        } catch (err) { }
    })
    db.$transaction(async (t) => {
        try {
            // -------------------------------------------------- init todo
            const l_t = await (await db.todos.aggregate({ _count: { id: true } }))._count.id
            if (l_t < 10) for (let i = 0; i < 10; i++) {
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
        } catch (err) { }
    })
    db.$transaction(async (t) => {
        try {
            // -------------------------------------------------- init product
            const l_p = (await db.products.aggregate({ _count: { id: true } }))._count.id ?? 0
            if (l_p < 10) for (let i = 0; i < 10; i++) {
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
                await db.$transaction(async (tr) => {
                    await product_quantity_updown(tr, p, 1)
                })
            }
        } catch (err) { }
    })
    db.$transaction(async (t) => {
        try {
            // -------------------------------------------------- init setting
            const l_s = (await t.settings.aggregate({ _count: { key: true } }))._count.key ?? 0
            if (l_s < 10) for (let i = 0; i < 10; i++) {
                await setting_set(t, faker.string.uuid(), faker.string.uuid())
            }
            // -------------------------------------------------- init invoice
        } catch (err) { }
    })
}

const generat_photo = () => {
    return faker.image.dataUri({ type: "svg-base64" })
}