import { MongoClient } from "mongodb"; //import the MongoDB client(ie.this next.js application) to connect to the database.

//meta.env for TS❌ process.env for next.js✅
const uri = process.env.MONGODB_URI as string;
//get secret MongoDB URI from .env.local

//create variables to hold the client and the promise to connect
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

//throw error if URI is missing - safety check
if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

//declare a global variable for 'dev mode' to avoid reconnecting on every refresh.
declare global {
  //eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  //in dev mode
  if (!global._mongoClientPromise) {
    //if theres no promise(ie.no connection established)
    //then create a client and connect with client now.
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;

  //Only connect once and reuse the promise to prevent too many connections.
} //in production,connect normally(no need for global variables)
else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
//export the promise so you can use the database in API routes.
