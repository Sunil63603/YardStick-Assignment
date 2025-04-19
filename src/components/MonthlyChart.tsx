import { useQuery } from "@tanstack/react-query"; //React-query is used to simply process of fetching(no useState and useEffect combination.)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
}

const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch("/api/transactions");
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

const MonthlyChart = () => {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const monthlyData = useMemo(() => {
    const map: { [key: string]: number } = {};

    transactions.forEach((tx: Transaction) => {
      const date = new Date(tx.date);
      const month = date.toLocaleString("default", { month: "short" });
      map[month] = (map[month] || 0) + tx.amount;
    });

    return Object.entries(map).map(([month, total]) => ({
      month,
      total,
    }));
  }, [transactions]);

  if (isLoading) return <p>Loading chart...</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Monthly Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3"></CartesianGrid>
          <XAxis
            dataKey="month"
            label={{ value: "Month", position: "insideButton", offset: -5 }}
          ></XAxis>
          <YAxis
            label={{ value: "Amount", angle: -90, position: "insideLeft" }}
          ></YAxis>
          <Tooltip formatter={(value: number) => `${value}`}></Tooltip>
          <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]}></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
