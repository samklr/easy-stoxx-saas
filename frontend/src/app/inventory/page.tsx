"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Search, Filter, Save, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

// Mock Data
const initialCategories = [
    { id: "1", name: "Alcohol" },
    { id: "2", name: "Housekeeping" },
    { id: "3", name: "Food" },
];

const initialItems = [
    { id: 1, name: "Premium Vodka", sku: "ALC-001", category: "Alcohol", quantity: 12, unit: "Bottle", status: "In Stock", price: 45.00, currency: "USD" },
    { id: 2, name: "Napkins (White)", sku: "HK-042", category: "Housekeeping", quantity: 500, unit: "Pack", status: "In Stock", price: 12.50, currency: "USD" },
    { id: 3, name: "Ribeye Steak", sku: "FD-104", category: "Food", quantity: 5, unit: "kg", status: "Low Stock", price: 28.90, currency: "USD" },
    { id: 4, name: "Toilet Paper", sku: "HK-001", category: "Housekeeping", quantity: 120, unit: "Roll", status: "In Stock", price: 0.80, currency: "USD" },
    { id: 5, name: "Red Wine", sku: "ALC-005", category: "Alcohol", quantity: 0, unit: "Bottle", status: "Out of Stock", price: 18.00, currency: "USD" },
];

export default function InventoryPage() {
    // State
    const [items, setItems] = useState(initialItems);
    const [categories, setCategories] = useState(initialCategories);

    // Dialog States
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    // Form States
    const [editingItem, setEditingItem] = useState<typeof initialItems[0] | null>(null);
    const [itemFormData, setItemFormData] = useState({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        unit: "",
        status: "In Stock",
        price: 0,
        currency: "USD"
    });

    const [newCategoryName, setNewCategoryName] = useState("");

    // --- Item Handlers ---

    const handleOpenAddItem = () => {
        setEditingItem(null);
        setItemFormData({
            name: "",
            sku: "",
            category: categories[0]?.name || "", // Default to first category
            quantity: 0,
            unit: "",
            status: "In Stock",
            price: 0,
            currency: "USD"
        });
        setIsItemDialogOpen(true);
    };

    const handleOpenEditItem = (item: typeof initialItems[0]) => {
        setEditingItem(item);
        setItemFormData(item);
        setIsItemDialogOpen(true);
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            // Edit existing
            setItems(items.map(item => item.id === editingItem.id ? { ...itemFormData, id: item.id } : item));
        } else {
            // Add new
            setItems([...items, { ...itemFormData, id: items.length + 1 }]);
        }
        setIsItemDialogOpen(false);
    };

    // --- Category Handlers ---

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const newCategory = {
            id: Date.now().toString(),
            name: newCategoryName.trim()
        };

        setCategories([...categories, newCategory]);
        setNewCategoryName("");
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-transparent min-h-screen text-foreground">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <Header title="Inventory" subtitle="Manage your stock items and levels" />

                    {/* Action Buttons */}
                    <div className="flex gap-2 -mt-4">
                        <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)} className="bg-background/20 border-primary/20 hover:bg-primary/10">
                            <Settings className="mr-2 h-4 w-4" /> Manage Categories
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleOpenAddItem}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground" placeholder="Search items..." />
                        </div>
                        <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>

                    {/* Inventory Table */}
                    <GlassCard className="p-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-muted-foreground">SKU</TableHead>
                                    <TableHead className="text-muted-foreground">Category</TableHead>
                                    <TableHead className="text-muted-foreground">Unit Cost</TableHead>
                                    <TableHead className="text-muted-foreground">Quantity</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => handleOpenEditItem(item)}
                                    >
                                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono">
                                            {item.currency === 'USD' ? '$' : item.currency === 'EUR' ? '€' : item.currency}
                                            {item.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{item.quantity} {item.unit}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'In Stock' ? 'bg-green-500/20 text-green-400' :
                                                item.status === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </GlassCard>

                    {/* --- Item Dialog --- */}
                    <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                        <DialogContent className="sm:max-w-[500px] bg-background/95 border-border backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? 'Update inventory details.' : 'Add a new item to your stock.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSaveItem} className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={itemFormData.name}
                                            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                            className="bg-background/50"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={itemFormData.sku}
                                            onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
                                            className="bg-background/50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={itemFormData.category}
                                            onValueChange={(val) => setItemFormData({ ...itemFormData, category: val })}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={itemFormData.quantity}
                                                onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 0 })}
                                                className="bg-background/50"
                                                required
                                            />
                                            <Input
                                                id="unit"
                                                placeholder="Unit"
                                                value={itemFormData.unit}
                                                onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                                                className="bg-background/50 w-20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cost per Unit</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={itemFormData.currency}
                                            onValueChange={(val) => setItemFormData({ ...itemFormData, currency: val })}
                                        >
                                            <SelectTrigger className="w-[100px] bg-background/50">
                                                <SelectValue placeholder="Curr" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={itemFormData.price}
                                            onChange={(e) => setItemFormData({ ...itemFormData, price: parseFloat(e.target.value) || 0 })}
                                            className="bg-background/50 flex-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="mt-4">
                                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                                        <Save className="mr-2 h-4 w-4" /> Save Item
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* --- Category Management Dialog --- */}
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                        <DialogContent className="sm:max-w-[400px] bg-background/95 border-border backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle>Manage Categories</DialogTitle>
                                <DialogDescription>
                                    Add or remove item categories.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Add New */}
                                <form onSubmit={handleAddCategory} className="flex gap-2">
                                    <Input
                                        placeholder="New Category Name..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="bg-background/50 flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newCategoryName.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </form>

                                {/* List */}
                                <div className="space-y-2 bg-background/30 p-2 rounded-md max-h-[200px] overflow-y-auto">
                                    {categories.length === 0 && <p className="text-sm text-center text-muted-foreground p-2">No categories yet.</p>}
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 group">
                                            <span className="text-sm">{cat.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteCategory(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            </main>
        </div>
    );
}
