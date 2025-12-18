"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Cell, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SenderChart = ({ data = [] }) => {
  const normalizeStatus = (status) =>
    status.replace(/\s+/g, "").toLowerCase();

  const pieData = data.map((item) => ({
    status: item.status,
    key: normalizeStatus(item.status),
    count: item.count,
  }));

  const COLORS = {
    delivered: "#f59e0b", // Amber 500
    intransit: "#f97316", // Orange 500
    deliveryattempted: "#b91c1c", // Red 700
    picked: "#fbbf24", // Amber 400
    assigned: "#d97706", // Amber 600
    outfordelivery: "#f59e0b", // Amber 500 (Same as Delivered effectively)
    atdestinationwarehouse: "#78350f", // Amber 900
    cancelled: "#7f1d1d", // Red 900
  };

  return (
    <Card className="bg-linear-to-br from-[#1a1f29] to-[#0f141c] flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Order Status Distribution</CardTitle>
        <CardDescription className="text-white">Last 7 days</CardDescription>
      </CardHeader>

      <CardContent className="flex justify-center flex-1 items-center">
        <PieChart width={260} height={260}>
          <Tooltip />
          <Pie
            data={pieData}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[entry.key] || "#ccc"}
              />
            ))}
          </Pie>
        </PieChart>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Status-wise order breakdown <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          All order states included
        </div>
      </CardFooter>
    </Card>
  );
};

export default SenderChart;
