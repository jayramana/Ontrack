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

export function OrdersBarChart() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders")
        const orders = response.data
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d
        })

        const data = last7Days.map((date) => {
          const dateStr = date.toISOString().split("T")[0]
          const count = orders.filter((o) => o.createdAt.startsWith(dateStr)).length
          return {
            date: date.toLocaleDateString("en-US", { weekday: "short" }),
            count: count,
          }
        })
        
        setChartData(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
    }
    fetchOrders()
  }, [])

  return (
    <Card className="flex flex-col border-0 bg-linear-to-br from-[#1a1f29] to-[#0f141c]">
      <CardHeader>
        <CardTitle className="text-white">Daily Order Volume</CardTitle>
        <CardDescription className="text-gray-400">Last 7 Days</CardDescription>
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
