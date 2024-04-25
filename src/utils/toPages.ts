export const toPage = (_args: { page_number?: number, page_size_max?: number, items_count_all?: number }) => {
    const intLimit = (value: number, min: number, max: number): number => {
        const min_v = Math.floor(Math.min(Math.max(value, min), max))
        return min_v < 1 ? 1 : min_v;
    }
    let page_number = _args.page_number == undefined ? 1 : _args.page_number;
    let page_size_max = _args.page_size_max == undefined ? 50 : _args.page_size_max;
    let items_count_all = _args.items_count_all == undefined ? 0 : _args.items_count_all;

    let pages_count_all = Math.ceil(items_count_all / page_size_max)
    page_number = intLimit(page_number, 1, pages_count_all)
    page_size_max = intLimit(page_size_max, 1, 100)
    const skip = (page_number - 1) * page_size_max
    const take = page_size_max
    return { pages_count_all, page_number, skip, take }
}
