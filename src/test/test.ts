import { db_user } from "../data"

const main = async () => {
    const r = await db_user.users_page_get({ filter_id: "a" })
    console.log(r)
}

main()