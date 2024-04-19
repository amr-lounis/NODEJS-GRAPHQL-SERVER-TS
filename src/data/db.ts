import { PrismaClient } from '@prisma/client';

class Models {
    private static instance = new PrismaClient()
    public static getInstance = () => Models.instance;
    constructor() {
        console.log(" ----- PrismaClient init")
    }
}
export const db = Models.getInstance();