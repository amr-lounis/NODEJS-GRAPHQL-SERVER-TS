import jwt from "jsonwebtoken";

const JWT_Secret = "jwtSecret"
const JWT_ExpiresDay = "30 days"

export type userThisType = {
    id: string,
    role: string
}
class token_controller {
    constructor() { }

    Token_Create(id, role) {
        const payload: userThisType = { id: id, role: role };
        const token = jwt.sign(payload, JWT_Secret, { expiresIn: JWT_ExpiresDay });
        return token;
    }

    Token_Verifay(_token) {
        try {
            const tv = jwt.verify(_token, JWT_Secret);
            return tv;
        } catch (error) {
            return { id: null, role: null }
        }
    }
}

export const MyToken = new token_controller();