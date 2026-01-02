import { useEffect, useState } from "react";
import { formatStatus } from "@/lib/utils";
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
// Map statuses to a pure orange gradient as requested (light to dark orange)
const statusColorMap = {
  PendingAssignment: "#ffedd5",     // Very light orange
  AtOriginWarehouse: "#fed7aa",     // Light orange
  Assigned: "#fdba74",              // Soft orange
  InTransit: "#fb923c",             // Medium orange
  OutForDelivery: "#f97316",        // Bright orange
  AtDestinationWarehouse: "#ea580c",// Darker orange
  Delivered: "#c2410c",             // Deep orange (but not blood red)
  DeliveryAttempted: "#9a3412",     // Darkest orange (used sparingly)
  Cancelled: "#7c2d12",             // Brownish orange (for cancelled)
};

const chartConfig = {
  orders: {
    label: "Orders",
  },
  PendingAssignment: {
    label: "Pending",
    color: "#ffedd5", 
  },
  AtOriginWarehouse: {
    label: "At Origin",
    color: "#fed7aa", 
  },
  Assigned: {
    label: "Assigned",
    color: "#fdba74", 
  },
  InTransit: {
    label: "In Transit",
    color: "#fb923c", 
  },
  OutForDelivery: {
    label: "Out For Delivery",
    color: "#f97316", 
  },
  AtDestinationWarehouse: {
    label: "At Destination",
    color: "#ea580c", 
  },
  Delivered: {
    label: "Delivered",
    color: "#c2410c", 
  },
  DeliveryAttempted: {
    label: "Exception",
    color: "#9a3412", 
  },
  Cancelled: {
    label: "Cancelled",
    color: "#7c2d12", 
  },
};


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0b0f14] border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-3 min-w-[150px]">
        <div 
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: data.fill || data.payload?.fill }}
        />
        <span className="text-slate-300 font-medium text-sm">
          {formatStatus(data.name)}
        </span>
        <span className="text-white font-black ml-auto text-sm">
          {data.value}
        </span>
      </div>
    );
  }
  return null;
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
              content={<CustomTooltip />}
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
