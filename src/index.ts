import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { applyMiddleware } from 'graphql-middleware'
import { makeSchema } from 'nexus';
import * as types_gql from './gql';
import { myConfig } from './config';
import { MyToken, myLog, https_server, myMiddleware, ws_server, http_server, db_init } from './utils';
// --------------------------------------------------
const main = async () => {
  // -----------------------
  const schema = makeSchema({
    types: types_gql,
  });
  const listOperationName = [...Object.keys(schema.getMutationType()['_fields']), ...Object.keys(schema.getQueryType()['_fields'])]
  await db_init(listOperationName)
  // -----------------------
  const app = express();
  //
  const schemaWithMiddleware = applyMiddleware(schema, myMiddleware)
  // ----------------------- https or http
  const server = myConfig.SERVER_SSL ? https_server(app, "./assets/certificate.crt", "./assets/private.key") : http_server(app);
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
      const headerToken = ctx?.req?.headers?.token || '';
      return { jwt: MyToken.Token_Verifay(headerToken) };
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
  if (myConfig.SERVER_SSL) {
    server.listen(myConfig.PORT_HTTPS, () => {
      myLog(`https://localhost:${myConfig.PORT_HTTPS}/graphql`);
    });
  } else {
    server.listen(myConfig.PORT_HTTP, () => {
      myLog(`http://localhost:${myConfig.PORT_HTTP}/graphql`);
    });
  }
};
// --------------------------------------------------
main()
// --------------------------------------------------