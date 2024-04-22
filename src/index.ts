import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import https from "https";
import http from "http";
import fs from "fs"
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { applyMiddleware } from 'graphql-middleware'
import { makeSchema } from 'nexus';
import * as types_gql from './typesgql';
import { MyToken, myLog } from './utils';
import { db_role, db_init } from './data';
// --------------------------------------------------
export const schema = makeSchema({
  types: types_gql,
});
// --------------------------------------------------
const port = 3000;
const serverSSL = false
// --------------------------------------------------
const main = async () => {
  // -----------------------
  const listOperationName = [...Object.keys(schema.getMutationType()['_fields']), ...Object.keys(schema.getQueryType()['_fields'])]
  await db_init(listOperationName)
  // -----------------------
  const app = express();
  //
  const schemaWithMiddleware = applyMiddleware(schema, info_GraphqlMiddleware)
  // ----------------------- https or http
  const server = serverSSL ? https_server(app, "./assets/cert.pem", "./assets/key.pem") : http_server(app);
  // ----------------------- ws
  const serverCleanup = ws_server(server, schema)
  // ----------------------- ApolloServer
  const apolloServer = new ApolloServer({
    schema: schemaWithMiddleware,
    csrfPrevention: false,
    formatError(err) {
      return new Error(err.message);
    },
    context: (ctx) => {
      const token = ctx?.req?.headers?.authorization || '';
      return { userThis: MyToken.Token_Verifay(token) };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" })
  // ------------------------------------------------ listen
  server.listen(port, () => {
    myLog(`localhost:${port}/graphql`);
  });
};
// -------------------------------------------------- https_server
const https_server = (_app_express, _path_cert, _path_key) => {
  myLog(" +++++ https_server +++++ ")
  const serverOptions = {
    cert: fs.readFileSync(_path_cert),
    key: fs.readFileSync(_path_key)
  }
  return https.createServer(serverOptions, _app_express);
}
// -------------------------------------------------- http_server
const http_server = (_app_express) => {
  myLog(" +++++ http_server +++++ ")
  return http.createServer(_app_express);
}
// -------------------------------------------------- ws_server
const ws_server = (_server, _schema) => {
  const wsServer = new WebSocketServer({
    server: _server,

  });
  return useServer({
    schema: _schema,
    context: (ctx, msg, args) => {
      const token = ctx?.connectionParams?.Authorization || ''
      return { userThis: MyToken.Token_Verifay(token) };
    },
    onConnect: async (ctx) => {
      const token = ctx?.connectionParams?.Authorization || ''
      const userThis = MyToken.Token_Verifay(token);

      if (userThis.id == null) {// return false to sertver disconnect ro throw new Error('')
        myLog(`-------------- WS : token not authorized : [${JSON.stringify(userThis)}]`)
        return false;
      }
    },
    onDisconnect(ctx, code, reason) { },
  }
    , wsServer);
}
//-------------- Middlewares
async function info_GraphqlMiddleware(resolve, root, args, context, info) {
  if ((info?.parentType?.name == 'Query') || (info?.parentType?.name == 'Mutation')) {
    const operationName = info?.fieldName || ''
    const operationType = info?.parentType?.name || '';
    const userThis = context.userThis;
    const r = db_role.authorization_get(userThis.role, operationName)
    if (!r) throw Error(`role:${userThis.role} --- operationName:${operationName} not authorized .`)
    if (args?.id?.length < 3) return new Error("id length smal then 3 ")
    myLog(`context :${JSON.stringify(context)} --- args : [${Object.keys(args)}] `)
  }
  return await resolve(root, args, context, info)
}
// --------------------------------------------------
main()
// --------------------------------------------------