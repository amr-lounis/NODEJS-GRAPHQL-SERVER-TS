
enum invoice_types {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    LOSS = "LOSS"
}

const main = async () => {
    try {
        // await product_create({ id: "aaaaa" })
        // await product_stock_set({ productId: "aaaaaa" })
        // await product_stock_quantity_updown("aaaaa", 10)
        console.log(invoice_types.PURCHASE)
    } catch (error) {

    }

}

main();