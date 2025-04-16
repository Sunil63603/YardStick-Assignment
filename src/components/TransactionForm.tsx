"use client";
import { JSX, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form"; //imported main hook from React hook Form to handle the form logic.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

//TS imports , interfaces and type-aliases.
//TS types,imports,type-aliases
type Transaction = {
  _id: string; //unique id , automatically generated by mongoDB while storing data
  amount: number;
  date: string;
  description: string;
};

type Props = {
  onSuccess?: () => void;
  onClose: () => void;
  editableTx?: Transaction | null;
};

type FormData = {
  amount: number;
  date: string;
  description: string;
};

//this form component is used inside 'app/transactions/page.tsx'.
export default function TransactionForm({
  onSuccess,
  onClose,
  editableTx,
}: Props): JSX.Element {
  const queryClient = useQueryClient();

  const {
    register, //connects inputs to the form.
    handleSubmit, //runs when form is submitted.
    reset, //this method is called when 'add transaction' gets successful.
    formState: { errors }, //holds validation error info.
  } = useForm<FormData>({
    //prefilling form if user has selected edit option.
    defaultValues: {
      description: editableTx?.description || "",
      amount: editableTx?.amount || 0,
      date: editableTx?.date
        ? new Date(editableTx.date).toISOString().substring(0, 10)
        : "",
    },
  });

  useEffect(() => {
    if (editableTx) {
      reset({
        description: editableTx.description,
        amount: editableTx.amount,
        date: new Date(editableTx.date).toISOString().substring(0, 10),
      });
    }
  }, [editableTx, reset]);

  //call this function on form submission.
  //while calling this function , i am not manually passing 'data' as parameter.
  const postTransaction = async (data: FormData) => {
    try {
      const res = await fetch("/api/transactions", {
        //while POSTing , specifically mention POST method.
        method: "POST", //POST() inside api/transactions/route will get triggered.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), //packs data as JSON
      });

      if (res.ok) {
        reset(); //clear form
      } else {
        console.error("Error while adding transaction");
      }
      return res.json();
    } catch (error) {
      console.error("Server error", error);
    }
  };

  const editTransaction = async ({ _id, ...updatedData }: { _id: string }) => {
    const res = await fetch(`/api/transactions/${_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("Failed to update transaction");
    return res.json();
  };

  //creating a mutation object and storing it in a variable called 'mutation'.
  //this object will help you to send data to server(ie.call postTransaction function)
  const addMutation = useMutation({
    mutationFn: postTransaction, //function which runs when i send the data
    onSuccess: () => {
      //this executes when data is successfully sent.
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      if (onSuccess) onSuccess(); //close modal
    }, //refresh the list after adding a transaction.
  });
  //useMutation is react-query's function to handle data sending logic.

  const editMutation = useMutation({
    mutationFn: editTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated!");
    },
    onError: () => {
      toast.error("Update failed!");
    },
  });

  //function which runs when form is submitted.
  const onSubmit = (data: FormData) => {
    if (editableTx) {
      //EDIT mode
      editMutation.mutate({
        ...data,
        _id: editableTx._id, //Pass ID for backend
      });
    } //ADD mode
    else {
      addMutation.mutate(data); //Pass form data directly to the mutation
    }

    reset(); //clear the form
    onClose(); //call this to close form and setEditableTsx(null).
  };

  return (
    //'handleSubmit()' is called for validation before getting submitted.
    //'handleSubmit' of 'react-hook-form' automatically gathers form data and pass it to 'postTransaction'.
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* This 'Input' is coming from shadcn */}
      {/* 'register()' is used to connect inputs to the form. */}
      {/* here register is used to make 'amount' input compulsory. */}
      {/* valueAsNumber:true will make sure that amount is converted to number before saving */}
      <Input
        placeholder="Amount"
        {...register("amount", { required: true, valueAsNumber: true })}
      ></Input>
      {errors.amount && <p>Amount is required</p>}
      {/*if errors.amount is true , then display this text below input box*/}

      {/* here register is used to make 'date' input compulsory. */}
      <Input
        placeholder="Date"
        type="date"
        {...register("date", { required: true })}
      ></Input>
      {errors.date && <p>Date is required</p>}
      {/*if errors.date is true,then display this text below date box */}

      {/* here register is used to make 'desc' input complusory */}
      <Input
        placeholder="Description"
        {...register("description", { required: true })}
      ></Input>
      {errors.description && <p>Description is required</p>}
      {/*if errors.desc is true,then display this text below description box*/}

      <Button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blu-600"
      >
        {editableTx ? "Update" : "Add"}
      </Button>
    </form>
  );
}
