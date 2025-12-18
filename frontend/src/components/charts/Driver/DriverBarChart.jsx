"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A multiple bar chart"

const chartConfig = {
  assigned: {
    label: "Assigned",
    color: "#fbbf24", // Amber 400
  },
  accepted: {
    label: "Accepted",
    color: "#f59e0b", // Amber 500
  },
  rejected: {
    label: "Rejected",
    color: "#78350f", // Amber 900
  },
}

export default function DriverBarChart({ data = [] }) {
  // Logic:
  // 1. Filter last 7 days
  // 2. Group by Day (e.g. "Mon", "Tue")
  // 3. Calculate Assigned, Accepted, Rejected for each day

  // Helper to get day name
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const processData = () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyOrders = data.filter(o => new Date(o.scheduledDate) >= oneWeekAgo);
      
      // Initialize map for last 7 days
      const daysMap = {};
      for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          daysMap[dayName] = { day: dayName, assigned: 0, accepted: 0, rejected: 0 };
      }

      weeklyOrders.forEach(order => {
          const dayName = getDayName(order.scheduledDate);
          if (daysMap[dayName]) {
              const status = order.status;
              

              
              if (status === 'Delivered' || status === 'OutForDelivery') {
                  daysMap[dayName].accepted += 1;
              } else {
                  daysMap[dayName].rejected += 1;
              }
          }
      });

      // Calculate Assigned as the total
      Object.keys(daysMap).forEach(key => {
          daysMap[key].assigned = daysMap[key].accepted + daysMap[key].rejected;
      });


      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        if (daysMap[dayName]) {
            result.push(daysMap[dayName]);
        }
      }
      return result;
  };

  const chartData = processData();

  return (
    <Card className="flex flex-col bg-[#0b0f14] border-[#1f2937]">
      <CardHeader>
        <CardTitle className="text-white">Order Status History</CardTitle>
        <CardDescription className="text-gray-400">Assigned vs Accepted vs Rejected (Last 7 Days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} stroke="#374151" />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#9ca3af"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" className="bg-[#1a1f29] border-[#374151] text-white" />}
            />
            <Bar dataKey="assigned" fill="var(--color-assigned)" radius={4} name="Assigned" />
            <Bar dataKey="accepted" fill="var(--color-accepted)" radius={4} name="Accepted" />
            <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} name="Rejected" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm text-gray-400">
        <div className="flex gap-2 leading-none font-medium text-white">
          Weekly Overview <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="leading-none">
          Comparison of order outcomes
        </div>
      </CardFooter>
    </Card>
  )
}
