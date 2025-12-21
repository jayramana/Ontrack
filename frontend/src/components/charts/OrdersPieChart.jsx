import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import api from "../../services/api";

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

export const description = "A pie chart for order statuses";

// Map statuses to the CSS variables used in the original chart to preserve theme
const statusColorMap = {
  PendingAssignment: "#fbbf24",
  AtOriginWarehouse: "#fbbf24",
  Assigned: "#f59e0b",
  InTransit: "#f97316",
  OutForDelivery: "#d97706",
  AtDestinationWarehouse: "#78350f",
  Delivered: "#b45309",
  DeliveryAttempted: "#b91c1c",
  Cancelled: "#7f1d1d",
};

const chartConfig = {
  orders: {
    label: "Orders",
  },
  PendingAssignment: {
    label: "Pending",
    color: "#fbbf24", 
  },
  AtOriginWarehouse: {
    label: "At Origin",
    color: "#fbbf24", // Amber 400
  },
  Assigned: {
    label: "Assigned",
    color: "#f59e0b", // Amber 500
  },
  InTransit: {
    label: "In Transit",
    color: "#f97316", // Orange 500
  },
  OutForDelivery: {
    label: "Out For Delivery",
    color: "#d97706", // Amber 600
  },
  AtDestinationWarehouse: {
    label: "At Destination",
    color: "#78350f", // Amber 900
  },
  Delivered: {
    label: "Delivered",
    color: "#b45309", // Amber 700
  },
  DeliveryAttempted: {
    label: "Exception",
    color: "#b91c1c", // Red 700
  },
};

export function OrdersPieChart({ data: orders = [] }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!orders) return;

    // Calculate status counts from orders
    const counts = orders.reduce((acc, order) => {
        const status = order.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(counts).map(([status, count]) => {
      const colorVar = statusColorMap[status] || "var(--chart-5)";
      return {
        status: status,
        count: count,
        fill: colorVar,
      };
    });

    setChartData(data);
  }, [orders]);

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Order Status Distribution</CardTitle>
        <CardDescription className="text-gray-400">Current active orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium text-white">
          Tracking {chartData.reduce((acc, curr) => acc + curr.count, 0)} orders <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-gray-400">
          Real-time status updates
        </div>
      </CardFooter>
    </Card>
  );
}

export default OrdersPieChart;
