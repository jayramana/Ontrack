"use client"

import { useEffect, useState } from "react"
import { TrendingUp, DollarSign } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import api from "../../services/api"

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

const chartConfig = {
  amount: {
    label: "Spending",
    color: "#10b981", // Emerald 500
  },
}

export function OrdersSpendingChart({ data: orders = [], filterType = "1W" }) {
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

    let bucketData = [];

    if (isYearly) {
        // Last 12 Months
        bucketData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                label: d.toLocaleDateString("en-US", { month: "short" }),
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                amount: 0
            };
        });
    } else {
        // Last N Days
        bucketData = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return {
                label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
                key: d.toISOString().split("T")[0],
                amount: 0
            };
        });
    }

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
            // Ensure price is a number
            const price = parseFloat(o.price) || 0;
            bucket.amount += price;
        }
    });

    setChartData(bucketData)
  }, [orders, filterType])

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
           <DollarSign className="w-5 h-5 text-emerald-400" /> Spending History
        </CardTitle>
        <CardDescription className="text-gray-400">
            {filterType === "1Y" ? "Last 12 Months" : 
             filterType === "3M" ? "Last 90 Days" : 
             filterType === "1M" ? "Last 30 Days" : "Last 7 Days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              tick={{ fill: 'white' }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              content={
                <ChartTooltipContent 
                    indicator="line" 
                    hideLabel 
                    formatter={(value) => `$${value.toLocaleString()}`}
                />
              }
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="var(--color-amount)"
              fillOpacity={0.4}
              stroke="var(--color-amount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium text-white">
              Total Spending in this period: <span className="text-emerald-400">${chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none text-gray-400">
               Track your expenses
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
