const myLimit = (value: number, min: number, max: number): number => {
    value = value < min ? min : value;
    value = value > max ? max : value;
    return Math.floor(value);
}

export const toPage = (_args: { page_number?: number, page_size_max?: number, items_count_all?: number }) => {
    let page_number = _args.page_number == undefined ? 0 : _args.page_number;
    let page_size_max = _args.page_size_max == undefined ? 100 : _args.page_size_max;
    let items_count_all = _args.items_count_all == undefined ? 0 : _args.items_count_all;

    let pages_count_all = Math.ceil(items_count_all / page_size_max)

    page_number = myLimit(page_number, 1, pages_count_all)
    page_size_max = myLimit(page_size_max, 1, Number.MIN_SAFE_INTEGER)


    const skip = page_number * page_size_max
    const take = page_size_max
    return { items_count_all, pages_count_all, page_size_max, page_number, skip, take }
}

export const toPage2 = (items_count_all: number, page_size_max: number, age_number: number,) => {

}


const main = async () => {
    for (let i = -10; i < 10; i += 0.5) {
        console.log(myLimit(i, 1, 5))
    }
}

main()