import { db } from "../data"

const existRole = async (id: string): Promise<boolean> => {
    return await db.u_roles.findFirst({ select: { id: true }, where: { id: id } }) ? true : false
}

existRole('admin1').then((o) => {
    console.log(o)
})