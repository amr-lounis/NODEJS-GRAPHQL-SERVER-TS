import jwt from "jsonwebtoken";

const JWT_Secret = "jwtSecret"
const JWT_ExpiresDay = "30 days"

class token_controller {
    constructor() { }

    Token_Create(id, username, role) {
        const payload = { id: id, user: username, role: role };
        // console.log("Token_Create : ", { id: id, user: name, role: role })
        const token = jwt.sign(payload, JWT_Secret, { expiresIn: JWT_ExpiresDay });
        // console.log({ token: token })
        return token;
    }

    Token_Verifay(_token) {
        try {
            const tv = jwt.verify(_token, JWT_Secret);
            // console.log("Token_Verifay : ",tv)
            return tv;
        } catch (error) {// console.log('------------- anonymous');
            return { id: null, name: 'anonymous', role: null }
        }
    }
}

export const MyToken = new token_controller();