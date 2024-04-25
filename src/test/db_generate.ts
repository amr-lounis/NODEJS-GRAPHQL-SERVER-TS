import { faker } from "@faker-js/faker";
import { db_todo } from "../data/";

try {
    for (let i = 0; i < 100; i++) {
        db_todo.todo_create({
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
        })
    }
} catch (error) { }