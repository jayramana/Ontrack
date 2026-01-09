"use client"

import { useEffect, useState } from "react"
import { TrendingUp, IndianRupee } from "lucide-react"
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
    color: "#ff8a3d", // Orange
  },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0f14] border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-[150px]">
        <div className="text-slate-300 font-medium text-sm border-b border-white/10 pb-2 mb-1">
          {payload[0].payload.tooltipLabel || label}
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-sm bg-[#ff8a3d]"
          />
          <span className="text-gray-400 font-medium text-xs">
            Spending
          </span>
          <span className="text-white font-black ml-auto text-sm">
            ₹{payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function OrdersSpendingChart({ data: orders = [], filterType = "1W" }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (!orders) return;
    
    // ... (rest of logic unchanged)
    
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
        let lastMonth = -1;
        bucketData = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            
            let label = "";
            let tooltipLabel = "";
            const currentMonth = d.getMonth();

            if (filterType === "1W") {
                 label = d.toLocaleDateString("en-US", { weekday: "short" }); // "Mon"
                 tooltipLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } else {
                 // For 1M/3M: Show month only at start or when month changes
                 if (i === 0 || currentMonth !== lastMonth) {
                     label = d.toLocaleDateString("en-US", { month: "short" }); // "Jan"
                 }
                 tooltipLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Jan 29"
            }
            
            lastMonth = currentMonth;

            return {
                label: label,         // Show on X-Axis
                tooltipLabel: tooltipLabel, // Show in Tooltip
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
           <IndianRupee className="w-5 h-5 text-[#ff8a3d]" /> Spending History
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
              interval={0}
              tick={{ fill: 'white', fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              content={<CustomTooltip />}
            />
            <Area
              dataKey="amount"
              type="monotone"
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
              Total Spending in this period: <span className="text-[#ff8a3d]">₹{chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
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
