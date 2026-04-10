import { connect } from "mongoose";
import { logger } from "./logger";

const mongo_Url = process.env.MONGODB_URL;
if (!mongo_Url) {
  logger.error("MONGODB_URL environment variable is not set");
}

let cache = global.mongoose;
if (!cache) {
  cache = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = connect(mongo_Url!).then((c) => c.connection);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Reset the cached promise so the next call retries the connection
    cache.promise = null;
    cache.conn = null;
    logger.error("MongoDB connection failed", error);
  }

  return cache.conn;
};

export default connectDb;
