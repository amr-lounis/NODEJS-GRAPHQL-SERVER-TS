import { PubSub } from "graphql-subscriptions";
class Models {
    private static instance = new PubSub()
    public static getInstance = () => Models.instance;
}
export const pubsub = Models.getInstance();