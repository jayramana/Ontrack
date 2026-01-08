import { useMemo } from "react";
import { formatStatus } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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
} from "@/components/ui/chart";

// Map statuses to a pure orange gradient (light to dark orange)
const statusColorMap = {
  PendingAssignment: "#ffedd5",     // Very light orange
  AtOriginWarehouse: "#fed7aa",     // Light orange
  Assigned: "#fdba74",              // Soft orange
  InTransit: "#fb923c",             // Medium orange
  OutForDelivery: "#f97316",        // Bright orange
  AtDestinationWarehouse: "#ea580c",// Darker orange
  Delivered: "#c2410c",             // Deep orange
  DeliveryAttempted: "#9a3412",     // Darkest orange
  Cancelled: "#7c2d12",             // Brownish orange
};

const chartConfig = {
  orders: {
    label: "Orders",
  },
  PendingAssignment: { label: "Pending", color: "#ffedd5" },
  AtOriginWarehouse: { label: "At Origin", color: "#fed7aa" },
  Assigned: { label: "Assigned", color: "#fdba74" },
  InTransit: { label: "In Transit", color: "#fb923c" },
  OutForDelivery: { label: "Out For Delivery", color: "#f97316" },
  AtDestinationWarehouse: { label: "At Destination", color: "#ea580c" },
  Delivered: { label: "Delivered", color: "#c2410c" },
  DeliveryAttempted: { label: "Exception", color: "#9a3412" },
  Cancelled: { label: "Cancelled", color: "#7c2d12" },
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

const SenderChart = ({ data = [] }) => {
  
  const chartData = useMemo(() => {
    return data.map((item) => {
        // Backend returns status with spaces or camelCase, we need to map to our keys if possible
        // But the map keys match standard status enum.
        // If data.status comes as "Out For Delivery" we might need to exact match or relying on color fallback
        // Given reference implementation used keys, we try to match keys.
        // However, SenderChart input `data` is ALREADY aggregated [{status: 'Delivered', count: 5}, ...]
        // We just assign colors.
        
        // Remove spaces for key matching if needed, or keeping original status string if it matches map keys
        const rawStatus = item.status.replace(/\s+/g, ""); 
        // Try to find a matching key in our map (case-insensitive check might be robust)
        const key = Object.keys(statusColorMap).find(k => k.toLowerCase() === rawStatus.toLowerCase()) || item.status;
        
        return {
            status: item.status, // Keep original for display
            count: item.count,
            fill: statusColorMap[key] || "#ea580c"
        };
    });
  }, [data]);

  const totalOrders = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c] h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">Order Status Distribution</CardTitle>
        <CardDescription className="text-gray-400">Current active orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full min-h-[250px]"
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
              outerRadius={100} 
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 leading-none font-medium text-white">
          Tracking {totalOrders} orders <TrendingUp className="h-4 w-4 text-[#ea580c]" />
        </div>
        <div className="text-muted-foreground leading-none text-gray-400">
          Real-time status updates
        </div>
      </CardFooter>
    </Card>
  );
};

export default SenderChart;
