import { PrismaClient } from '@prisma/client';

class Models {
    private static instance = new PrismaClient()
    public static getInstance = () => Models.instance;
    constructor() {
        console.log(" ----- PrismaClient init")
    }
}
export const db = Models.getInstance();

// if (!global.pubsub) {
//     global.pubsub = new PubSub()
//     console.log("PubSub init")
// }

// export const pubsub = global.pubsub;
