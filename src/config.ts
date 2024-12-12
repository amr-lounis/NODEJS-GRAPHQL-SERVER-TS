export const myConfig: myConfigType = {
    JWT_Secret: "jwtSecret aaaaabbbbbcccccdddddeeeeefffff",
    JWT_ExpiresDay: "7 days",
    PORT_HTTP: 80,
    PORT_HTTPS: 443,
    SERVER_SSL: false
}
// -------------------------------------------------- types
type myConfigType = {
    JWT_Secret: string,
    JWT_ExpiresDay: string,
    PORT_HTTP: number,
    PORT_HTTPS: number,
    SERVER_SSL: boolean
}