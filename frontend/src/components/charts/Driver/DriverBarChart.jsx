"use client"

import { useEffect, useState } from "react"
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
  outForDelivery: {
    label: "Out For Delivery",
    color: "#f59e0b", // Amber 500
  },
  delivered: {
    label: "Delivered",
    color: "#10b981", // Emerald 500
  },
  attempted: {
    label: "Attempted",
    color: "#ef4444", // Red 500
  },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f29] border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-[150px]">
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
              {entry.name}
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

// ...

export default function DriverBarChart({ data = [], filterType = "1W" }) {
  // Data is now pre-processed by backend
  // Just render it.

  return (
    <Card className="flex flex-col bg-[#0b0f14] border-[#1f2937]">
      <CardHeader>
        <CardTitle className="text-white">Order Status History</CardTitle>
        <CardDescription className="text-gray-400">
           {filterType === "1Y" ? "Last 12 Months" : 
            filterType === "3M" ? "Last 90 Days" : 
            filterType === "1M" ? "Last 30 Days" : "Last 7 Days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
          <BarChart accessibilityLayer data={data} barSize={40}>
            <CartesianGrid vertical={false} stroke="#374151" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="assigned" fill="var(--color-assigned)" radius={[4, 4, 0, 0]} name="Total Assigned" stackId="a" />
            <Bar dataKey="outForDelivery" fill="var(--color-outForDelivery)" radius={[4, 4, 0, 0]} name="Out For Delivery" stackId="b" />
            <Bar dataKey="delivered" fill="var(--color-delivered)" radius={[0, 0, 4, 4]} name="Delivered" stackId="c" />
            <Bar dataKey="attempted" fill="var(--color-attempted)" radius={[4, 4, 0, 0]} name="Attempted" stackId="c" />
          </BarChart>

        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm text-gray-400">
        <div className="flex gap-2 leading-none font-medium text-white">
          Overview <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="leading-none">
          Comparison of order outcomes over time
        </div>
      </CardFooter>
    </Card>
  )
}
