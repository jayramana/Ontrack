"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Orange/Warm Palette based on user image
// 1. Light Orange/Gold
// 2. Bright Orange
// 3. Burnt Orange
// 4. Dark Red/Brown
const COLORS = {
  delivered: "#f59e0b", // Amber 500
  pending: "#f97316",   // Orange 500
  exceptions: "#b91c1c", // Red 700 (Darker red for contrast)
  cancelled: "#7f1d1d",  // Red 900
};

const chartConfig = {
  count: {
    label: "Orders",
  },
  delivered: {
    label: "Delivered",
    color: COLORS.delivered,
  },
  pending: {
    label: "Pending",
    color: COLORS.pending,
  },
  exceptions: {
    label: "Exceptions",
    color: COLORS.exceptions,
  },
  cancelled: {
      label: "Cancelled",
      color: COLORS.cancelled
  }
};

const DriverChart = ({ data = [] }) => {
  const totalOrders = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  // Transform simple data prop into chart-ready format if needed, 
  // but let's assume parent passes [{ status: 'delivered', count: 10, fill: '...' }]
  // Or we map it here.
  // Let's assume standard format: [{ status: 'Delivered', count: 10 }]
  
  const chartData = React.useMemo(() => {
      // safe mapping
      return data.map(item => {
          const key = item.status.toLowerCase();
          // Map backend status to color keys
          let color = COLORS.pending; // default
          if (key === 'delivered') color = COLORS.delivered;
          else if (key === 'pending') color = COLORS.pending;
          else if (key === 'deliveryattempted' || key === 'exceptions') color = COLORS.exceptions;
          else if (key === 'cancelled') color = COLORS.cancelled;
          
          return {
              ...item,
              fill: color
          }
      }).filter(item => item.count > 0);
  }, [data]);


  return (
    <Card className="flex flex-col bg-[#0b0f14] border-[#1f2937]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Delivery Status</CardTitle>
        <CardDescription className="text-gray-400">Order Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-[#1a1f29] border-[#374151] text-white" />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              strokeWidth={2}
            >
              {/* Label removed as this is now a full pie chart */}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none text-white">
          Overview of your current load <TrendingUp className="h-4 w-4 text-orange-500" />
        </div>
        <div className="leading-none text-gray-400">
          Showing distribution of all assigned orders
        </div>
      </CardFooter>
    </Card>
  );
}

export default DriverChart;
