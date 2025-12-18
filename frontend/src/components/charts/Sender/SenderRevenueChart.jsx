"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Tooltip,
} from "recharts";

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

const SenderRevenueChart = ({ data = [] }) => {
  const revenueConfig = {
    amount: {
      label: "Revenue",
      color: "#ffb500",
    },
  };

  return (
    <Card className="flex flex-col h-full bg-linear-to-br from-[#1a1f29] to-[#0f141c]"> {/* Match dashboard card style */}
      <CardHeader>
        <CardTitle className="text-white">Revenue Analytics</CardTitle>
        <CardDescription className="text-gray-400">Last 7 Days Revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="#374151" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#9ca3af" }} // Gray-400 for text
              tickFormatter={(value) => {
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                } catch (e) {
                  return value;
                }
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-[#1f2937] border-[#374151] text-white" />}
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="#ffb500"
              strokeWidth={2}
              dot={{
                fill: "#ffb500",
                stroke: "#ffb500",
              }}
              activeDot={{
                r: 6,
                fill: "#ffb500",
                stroke: "#fff",
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm mt-auto">
        <div className="flex text-white  gap-2 leading-none font-medium">
          Daily revenue trends <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-white text-muted-foreground leading-none">
          Showing total revenue for the last 7 days
        </div>
      </CardFooter>
    </Card>
  );
};

export default SenderRevenueChart;
