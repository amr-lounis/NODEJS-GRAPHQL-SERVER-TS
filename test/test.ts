import { myLog } from "../src/utils"
import { product_create, product_stock_quantity_updown, product_stock_set } from "../src/gql"
import { faker } from "@faker-js/faker"
import { type } from "os"

const main = async () => {
    try {
        // await product_create({ id: "aaaaa" })
        // await product_stock_set({ productId: "aaaaaa" })
        // await product_stock_quantity_updown("aaaaa", 10)
        myLog(faker.image.dataUri({ type: "svg-base64" }))
    } catch (error) {
        myLog(error.message)
    }

}

main();