import { GlassCard } from "@/components/ui/glass-card";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock data for low stock items
const lowStockItems = [
    { id: 1, name: "Ribeye Steak", sku: "FD-104", quantity: 5, unit: "kg", threshold: 10 },
    { id: 2, name: "Red Wine", sku: "ALC-005", quantity: 0, unit: "Bottle", threshold: 5 },
    { id: 3, name: "Olive Oil", sku: "FD-023", quantity: 2, unit: "Liter", threshold: 5 },
    { id: 4, name: "Champagne", sku: "ALC-012", quantity: 3, unit: "Bottle", threshold: 6 },
];

export function LowStockAlerts() {
    return (
        <GlassCard className="h-full flex flex-col">
            <div className="p-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
                        <p className="text-xs text-muted-foreground">{lowStockItems.length} items need attention</p>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 flex-1">
                <div className="space-y-3">
                    {lowStockItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <p className={`text-sm font-bold ${item.quantity === 0 ? 'text-destructive' : 'text-yellow-500'}`}>
                                    {item.quantity} {item.unit}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    min: {item.threshold}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <Link
                    href="/inventory"
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    View all inventory <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </GlassCard>
    );
}
