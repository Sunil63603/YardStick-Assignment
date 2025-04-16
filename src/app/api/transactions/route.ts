import { NextRequest, NextResponse } from "next/server"; //import special request/response types used in App Router API routes.
import clientPromise from "@/lib/mongodb"; //import MongoDB connection logic(ie.clientPromise) from 'lib/mongodb.ts' file

//define the shape/type of transaction using typescript.
type Transaction = {
  amount: number; //this was considered as 'string' in 'FormData'(ie.inside TransactionForm.tsx)
  date: string;
  description: string;
};

//POST method to insert a new transaction
export async function POST(req: NextRequest) {
  //handle post requests when user submits a form.

  //read form data(JSON) from the request body.
  const body = await req.json();
  const { amount, date, description } = body;

  //connect to your database and get the 'transactions' collection.
  const client = await clientPromise; //connect to database
  const db = client.db("finance-cluster"); //get particular cluster
  const collection = db.collection<Transaction>("transactions"); //get exact collection(ie.transactions) from

  //insert new transaction and return a success response.
  const result = await collection.insertOne({ amount, date, description });
  return NextResponse.json(result, { status: 201 });
}

//handle GET requests (eg.to display list of transactions)
export async function GET() {
  try {
    const client = await clientPromise; //connect to database
    const db = client.db("finance-cluster"); //get particular cluster
    const collection = db.collection<Transaction>("transactions"); //get exact collection from that cluster.

    //fetch all transactions and sort them by latest date first(just like STACK).
    const transactions = await collection.find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(transactions); //return the list as JSON to frontend.
  } catch (error) {
    console.error("Get request failed:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
