import jwt from "jsonwebtoken";
import { config } from "./";

export type userThisType = {
    id: string,
    role: string
}
class token_controller {
    constructor() { }

    Token_Create(id, role) {
        const payload: userThisType = { id: id, role: role };
        const token = jwt.sign(payload, config.JWT_Secret, { expiresIn: config.JWT_ExpiresDay });
        return token;
    }

    Token_Verifay(_token) {
        try {
            const tv = jwt.verify(_token, config.JWT_Secret);
            return tv;
        } catch (error) {
            return { id: null, role: null }
        }
    }
}

export const MyToken = new token_controller();