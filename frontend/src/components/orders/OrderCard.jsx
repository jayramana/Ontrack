import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function OrderCard({ order, onView }){
  const statusConfig = {
    PendingAssignment: { label: "Pending", className: "bg-secondary text-muted-foreground" },
    InTransit: { label: "In Transit", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    OutForDelivery: { label: "Out for Delivery", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    Delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  }

  const { label, className } =
    statusConfig[order.status] || { label: order.status, className: "bg-secondary" }

  return (
    <Card className="bg-card border-border hover:border-border/80 transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold bg-secondary px-2 py-1 rounded">
                {order.trackingId || `ORD-${order.id}`}
              </span>
              <Badge variant="outline" className={`text-xs ${className}`}>
                {label}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold">{order.receiverName}</h3>
              <p className="text-sm text-muted-foreground">
                {order.receiverAddress}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <p className="text-lg font-bold">₹{order.price}</p>
            <Button size="sm" variant="outline" onClick={onView}>
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
