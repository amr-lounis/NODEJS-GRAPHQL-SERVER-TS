
export const toPage = (_itemsCountAll: number, pageNumber?: number, itemsTake?: number) => {
    itemsTake = (itemsTake ?? 100)
    itemsTake = itemsTake < 1 ? 1 : itemsTake
    // 
    pageNumber = pageNumber ?? -10
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    // 
    let pagesCountAll = Math.ceil(_itemsCountAll / itemsTake)

    const itemsSkip = (pageNumber - 1) * itemsTake
    return { pagesCountAll, itemsTake, pageNumber, itemsSkip }
}