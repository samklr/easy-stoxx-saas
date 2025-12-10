"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { Download, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, ArrowRightLeft, Coins, Save, Plus, Minus } from "lucide-react";

// Mock Data
const stockByCategory = [
    { category: "Alcohol", itemCount: 24, totalQuantity: 156, totalValue: 4850.00, icon: "🍷" },
    { category: "Food & Ingredients", itemCount: 45, totalQuantity: 320, totalValue: 2890.50, icon: "🍖" },
    { category: "Housekeeping", itemCount: 18, totalQuantity: 1240, totalValue: 1856.00, icon: "🧹" },
    { category: "Beverages", itemCount: 12, totalQuantity: 480, totalValue: 1240.00, icon: "☕" },
    { category: "Dairy", itemCount: 8, totalQuantity: 95, totalValue: 456.80, icon: "🥛" },
    { category: "Supplies", itemCount: 22, totalQuantity: 890, totalValue: 1120.20, icon: "📦" },
];

const initialLowStockItems = [
    { id: 1, name: "Ribeye Steak", sku: "FD-104", quantity: 5, threshold: 10, unit: "kg" },
    { id: 2, name: "Red Wine", sku: "ALC-005", quantity: 0, threshold: 5, unit: "Bottle" },
    { id: 3, name: "Olive Oil", sku: "FD-023", quantity: 2, threshold: 5, unit: "Liter" },
    { id: 4, name: "Champagne", sku: "ALC-012", quantity: 3, threshold: 6, unit: "Bottle" },
];

type LowStockItem = typeof initialLowStockItems[0];

const stockMovements = {
    day: { in: 45, out: 32, net: 13 },
    week: { in: 234, out: 189, net: 45 },
    month: { in: 1245, out: 1102, net: 143 },
};

// Currency config
const currencies = {
    EUR: { symbol: "€", rate: 1, name: "Euro" },
    XAF: { symbol: "FCFA ", rate: 655.96, name: "CFA Franc" },
    USD: { symbol: "$", rate: 1.09, name: "US Dollar" },
};

type CurrencyCode = keyof typeof currencies;

export default function ReportsPage() {
    const [currency, setCurrency] = useState<CurrencyCode>("EUR");
    const [lowStockItems, setLowStockItems] = useState(initialLowStockItems);
    const [editingItem, setEditingItem] = useState<LowStockItem | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editQuantity, setEditQuantity] = useState(0);

    // Load default currency from localStorage on mount
    useEffect(() => {
        const savedCurrency = localStorage.getItem("defaultCurrency") as CurrencyCode;
        if (savedCurrency && currencies[savedCurrency]) {
            setCurrency(savedCurrency);
        }
    }, []);

    const formatCurrency = (value: number) => {
        const converted = value * currencies[currency].rate;
        return `${currencies[currency].symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleEditItem = (item: LowStockItem) => {
        setEditingItem(item);
        setEditQuantity(item.quantity);
        setIsEditDialogOpen(true);
    };

    const handleSaveQuantity = () => {
        if (editingItem) {
            setLowStockItems(items =>
                items.map(item =>
                    item.id === editingItem.id
                        ? { ...item, quantity: editQuantity }
                        : item
                ).filter(item => item.quantity < item.threshold) // Remove if no longer low stock
            );
        }
        setIsEditDialogOpen(false);
        setEditingItem(null);
    };

    const totalItems = stockByCategory.reduce((sum, cat) => sum + cat.totalQuantity, 0);
    const totalValue = stockByCategory.reduce((sum, cat) => sum + cat.totalValue, 0);

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-transparent min-h-screen text-foreground">
                <div className="p-8 space-y-8">
                    <Header title="Reports & Analytics" subtitle="Insights into your inventory performance" />

                    <div className="flex items-center justify-between -mt-4">
                        {/* Currency Selector */}
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-muted-foreground" />
                            <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                                <SelectTrigger className="w-[140px] bg-background/50 border-input">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
                                <Package className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{totalItems.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    across {stockByCategory.length} categories
                                </p>
                            </CardContent>
                        </GlassCard>
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
                                <p className="text-xs text-muted-foreground">
                                    +12.5% from last month
                                </p>
                            </CardContent>
                        </GlassCard>
                    </div>

                    {/* Stock Movements */}
                    <GlassCard>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                                <CardTitle>Stock Movements</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Today */}
                                <div className="p-4 rounded-lg bg-background/30 border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-3">Today</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-green-500" /> In
                                            </span>
                                            <span className="font-medium text-green-500">+{stockMovements.day.in}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingDown className="h-4 w-4 text-red-500" /> Out
                                            </span>
                                            <span className="font-medium text-red-500">-{stockMovements.day.out}</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex items-center justify-between">
                                            <span className="text-sm font-medium">Net</span>
                                            <span className={`font-bold ${stockMovements.day.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {stockMovements.day.net >= 0 ? '+' : ''}{stockMovements.day.net}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* This Week */}
                                <div className="p-4 rounded-lg bg-background/30 border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-3">This Week</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-green-500" /> In
                                            </span>
                                            <span className="font-medium text-green-500">+{stockMovements.week.in}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingDown className="h-4 w-4 text-red-500" /> Out
                                            </span>
                                            <span className="font-medium text-red-500">-{stockMovements.week.out}</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex items-center justify-between">
                                            <span className="text-sm font-medium">Net</span>
                                            <span className={`font-bold ${stockMovements.week.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {stockMovements.week.net >= 0 ? '+' : ''}{stockMovements.week.net}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* This Month */}
                                <div className="p-4 rounded-lg bg-background/30 border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-3">This Month</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-green-500" /> In
                                            </span>
                                            <span className="font-medium text-green-500">+{stockMovements.month.in}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm">
                                                <TrendingDown className="h-4 w-4 text-red-500" /> Out
                                            </span>
                                            <span className="font-medium text-red-500">-{stockMovements.month.out}</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex items-center justify-between">
                                            <span className="text-sm font-medium">Net</span>
                                            <span className={`font-bold ${stockMovements.month.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {stockMovements.month.net >= 0 ? '+' : ''}{stockMovements.month.net}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </GlassCard>

                    {/* Stock Value by Category */}
                    <GlassCard className="p-0 overflow-hidden">
                        <CardHeader className="p-6 pb-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle>Stock Value by Category</CardTitle>
                            </div>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Category</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Items</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Total Quantity</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Total Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockByCategory.map((cat, i) => (
                                    <TableRow key={i} className="border-border hover:bg-muted/50">
                                        <TableCell className="font-medium text-foreground">
                                            <span className="mr-2">{cat.icon}</span>
                                            {cat.category}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {cat.itemCount}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {cat.totalQuantity.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-green-500">
                                            {formatCurrency(cat.totalValue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="border-border bg-muted/30 hover:bg-muted/50">
                                    <TableCell colSpan={3} className="font-bold text-foreground">Total</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-green-500">
                                        {formatCurrency(totalValue)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </GlassCard>

                    {/* Low Stock Items */}
                    <GlassCard>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Low Stock Items</CardTitle>
                                    <p className="text-sm text-muted-foreground">{lowStockItems.length} items need attention</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {lowStockItems.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>All items are well stocked!</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {lowStockItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleEditItem(item)}
                                            className="flex flex-col p-4 rounded-xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                                </div>
                                                {item.quantity === 0 && (
                                                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-destructive text-destructive-foreground">
                                                        Out
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-auto pt-2 border-t border-destructive/10">
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Current</p>
                                                        <p className={`text-lg font-bold ${item.quantity === 0 ? 'text-destructive' : 'text-yellow-500'}`}>
                                                            {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Min</p>
                                                        <p className="text-sm font-medium text-muted-foreground">{item.threshold}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </GlassCard>

                </div>
            </main>

            {/* Edit Low Stock Item Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-background/95 border-border backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle>Update Stock Level</DialogTitle>
                        <DialogDescription>
                            {editingItem && (
                                <>Update the quantity for <strong>{editingItem.name}</strong></>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {editingItem && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12"
                                    onClick={() => setEditQuantity(Math.max(0, editQuantity - 1))}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="text-center text-2xl font-bold h-12 bg-background/50"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12"
                                    onClick={() => setEditQuantity(editQuantity + 1)}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                <span>{editingItem.unit}</span>
                                <span className="mx-2">•</span>
                                <span>Minimum: {editingItem.threshold}</span>
                            </div>
                            {editQuantity >= editingItem.threshold && (
                                <div className="text-center text-sm text-green-500 font-medium">
                                    ✓ Stock level is sufficient. Item will be removed from low stock list.
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveQuantity} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Save className="mr-2 h-4 w-4" /> Update Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
