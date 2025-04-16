import { NextResponse, NextRequest } from "next/server"; //to send a response.
import clientPromise from "@/lib/mongodb"; //to connect to MongoDB
import { ObjectId } from "mongodb"; //mongoDB needs ID in a special format.

//this runs when someone sends a DELETE request.
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise; //connect to MDB server.
    const db = client.db("finance-cluster"); //go to cluster called 'finance-cluster'.
    const collection = db.collection("transactions"); //pick the 'transactions' collection

    const { id } = await params; //this grabs ID from URL

    //'new ObjectId(id)' because mongoDB needs ID in a special format.
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    //deleteOne actually deletes that document from collection

    if (result.deletedCount === 0) {
      //if no item was deleted,show not found.
      return NextResponse.json(
        //sends back a message to the frontend
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Error deleting transaction" },
      { status: 500 }
    );
  }
}

//PUT - update a transaction.
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("finance-cluster");
    const collection = db.collection("transaction");

    const { id } = await context.params;
    const body = await req.json();

    const updated = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: body,
      }
    );

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed to update", error }),
      {
        status: 500,
      }
    );
  }
}
