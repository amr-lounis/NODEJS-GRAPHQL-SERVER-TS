import { myLog } from "../src/utils"
import { product_create, product_stock_add, product_stock_reduce, product_stock_set } from "../src/gql"

const main = async () => {
    try {
        // await product_create({ id: "aaaaa" })
        // await product_stock_set({ productId: "aaaaaa" })
        await product_stock_reduce("aaaaa", 10)
    } catch (error) {
        myLog(error.message)
    }

}

main();