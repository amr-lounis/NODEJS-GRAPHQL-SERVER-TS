import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from 'ws'
import https from "https";
import http from "http";
import fs from "fs"
import { MyToken } from "./token_controller";
import { authorization_matrix } from "./authorization_matrix"
import { myLog } from "./myFunc";
// -------------------------------------------------- https_server
export const https_server = (_app_express: any, _path_cert: string, _path_key: string) => {
    myLog(" +++++ https_server +++++ ")
    const serverOptions = {
        cert: fs.readFileSync(_path_cert),
        key: fs.readFileSync(_path_key)
    }
    return https.createServer(serverOptions, _app_express);
}
// -------------------------------------------------- http_server
export const http_server = (_app_express: any) => {
    myLog(" +++++ http_server +++++ ")
    return http.createServer(_app_express);
}
// -------------------------------------------------- ws_server
export const ws_server = (_server: any, _schema: any) => {
    const wsServer = new WebSocketServer({
        server: _server,

    });
    return useServer({
        schema: _schema,
        context: (ctx, msg, args) => {
            const headerToken = ctx?.connectionParams?.token || ''
            return { jwt: MyToken.Token_Verifay(headerToken) };
        },
        onConnect: async (ctx) => {
            const headerToken = ctx?.connectionParams?.token || ''
            const jwt = MyToken.Token_Verifay(headerToken);

            if (jwt.id == null) {// return false to sertver disconnect ro throw new Error('')
                return false;
            }
        },
        onDisconnect(ctx, code, reason) { },
    }
        , wsServer);
}
//-------------- Middlewares
export const myMiddleware = async (resolve: any, root: any, args: any, context: ContextType, info: any) => {
    if ((info?.parentType?.name == 'Query') || (info?.parentType?.name == 'Mutation')) {
        context.operation = info?.fieldName || ''
        context.fields = info.fieldNodes[0].selectionSet?.selections?.map((field) => field.name.value);
        const r = authorization_matrix.authorization_test(context.jwt.role, context.operation)
        if (!r) throw Error(`role:${context.jwt.role} --- operation:${context.operation} not authorized .`)
        if (args?.id?.length < 1) return new Error("id length smal then 1 ")
        myLog(`context:${JSON.stringify(context)} --- args:[${Object.keys(args)}]`)
    }
    return await resolve(root, args, context, info)
}

export type ContextType = {
    operation?: string,
    fields?: string[],
    jwt?: {
        id: string,
        role: string,
        iat: number,
        exp: number
    }
}