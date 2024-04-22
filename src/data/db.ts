import { PrismaClient } from '@prisma/client';
import { myLog } from '../utils';

class Models {
    private static instance = new PrismaClient()
    public static getInstance = () => Models.instance;
    constructor() {
        myLog(" ----- PrismaClient init")
    }
}
export const db = Models.getInstance();