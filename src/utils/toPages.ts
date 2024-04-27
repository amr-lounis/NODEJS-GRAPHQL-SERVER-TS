
export const toPage = (itemsCountAll: number, pageNumber?: number, itemsTake?: number) => {
    itemsTake = (itemsTake ?? 100);
    itemsTake = itemsTake < 1 ? 1 : itemsTake;
    // 
    pageNumber = pageNumber ?? -10;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // 
    let allPagesCount = Math.ceil(itemsCountAll / itemsTake);
    pageNumber = pageNumber > allPagesCount ? allPagesCount : pageNumber;
    // 
    allPagesCount = allPagesCount < 1 ? 1 : allPagesCount;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // 
    const itemsSkip = (pageNumber - 1) * itemsTake;
    return { allPagesCount, itemsTake, pageNumber, itemsSkip };
}