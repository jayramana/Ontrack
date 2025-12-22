import { useEffect, useState } from "react"
import api from "../../services/api"
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

export const description = "A bar chart"

const chartConfig = {
  count: {
    label: "Orders",
    color: "#f97316", // Orange 500
  },
}

export function OrdersBarChart({ data: orders = [], filterType = "1W" }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (!orders) return;

    const getDays = () => {
      if (filterType === "1Y") return 365;
      if (filterType === "3M") return 90;
      if (filterType === "1M") return 30;
      return 7; // 1W
    };

    const days = getDays();
    const isYearly = filterType === "1Y";

    // Generate buckets
    // If Yearly, buckets are Months (Jan, Feb...)
    // If others, buckets are Days
    
    let bucketData = [];

    if (isYearly) {
        // Generate last 12 months
        bucketData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                dateObj: d,
                label: d.toLocaleDateString("en-US", { month: "short" }),
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, // YYYY-MM
                count: 0
            };
        });
    } else {
         // Generate last N days
         bucketData = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return {
                dateObj: d,
                label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }), // Mon 1
                key: d.toISOString().split("T")[0], // YYYY-MM-DD
                count: 0
            };
        });
    }

    // Fill buckets
    orders.forEach(o => {
        if (!o.createdAt) return;
        const oDate = new Date(o.createdAt);
        
        let key = "";
        if (isYearly) {
             key = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
             key = oDate.toISOString().split("T")[0];
        }

        const bucket = bucketData.find(b => b.key === key);
        if (bucket) {
            bucket.count++;
        }
    });

    setChartData(bucketData.map(b => ({ date: b.label, count: b.count })));

  }, [orders, filterType])

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c]">
      <CardHeader>
        <CardTitle className="text-white">Order Volume</CardTitle>
        <CardDescription className="text-gray-400">
            {filterType === "1Y" ? "Last 12 Months" : 
             filterType === "3M" ? "Last 90 Days" : 
             filterType === "1M" ? "Last 30 Days" : "Last 7 Days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              tick={{ fill: 'white' }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
