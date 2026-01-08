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
  normal: {
    label: "Normal",
    color: "#f97316", // Orange 500
  },
  asr: {
    label: "ASR",
    color: "#fed7aa", // Orange 200
  },
}


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0f14] border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-[150px]">
        <div className="text-slate-300 font-medium text-sm border-b border-white/10 pb-2 mb-1">
          {payload[0].payload.tooltipLabel || label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-gray-400 font-medium text-xs capitalized">
              {entry.name === "normal" ? "Standard" : "ASR"}
            </span>
            <span className="text-white font-black ml-auto text-sm">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
    
    let bucketData = [];

    if (isYearly) {
        // Generate last 12 months
        bucketData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                label: d.toLocaleDateString("en-US", { month: "short" }),
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                normal: 0,
                asr: 0
            };
        });
    } else {
         // Generate last N days
         let lastMonth = -1;
         bucketData = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            
            let label = "";
            let tooltipLabel = "";
            const currentMonth = d.getMonth();

            // LABEL LOGIC:
            // 1W -> Show Day Name (Mon, Tue)
            // 1M/3M -> Show Month Name (Jan) only when it changes
            if (filterType === "1W") {
                 label = d.toLocaleDateString("en-US", { weekday: "short" }); // "Mon"
                 tooltipLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } else {
                 if (i === 0 || currentMonth !== lastMonth) {
                     label = d.toLocaleDateString("en-US", { month: "short" }); // "Jan"
                 }
                 tooltipLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }
            
            lastMonth = currentMonth;

            return {
                label: label,
                tooltipLabel: tooltipLabel,
                key: d.toISOString().split("T")[0],
                normal: 0,
                asr: 0
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
            if (o.isASR) {
                bucket.asr++;
            } else {
                bucket.normal++;
            }
        }
    });

    setChartData(bucketData);
  }, [orders, filterType])

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c]">
      <CardHeader>
        <CardTitle className="text-white">Delivery Types</CardTitle>
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
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              tick={{ fill: 'white', fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              content={<CustomTooltip />}
            />
            <Bar 
                dataKey="normal" 
                stackId="a" 
                fill="var(--color-normal)" 
                radius={[0, 0, 4, 4]} 
            />
             <Bar 
                dataKey="asr" 
                stackId="a" 
                fill="var(--color-asr)" 
                radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

