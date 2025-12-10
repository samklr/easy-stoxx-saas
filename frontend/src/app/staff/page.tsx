"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Locale, createTranslator } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Package,
    Search,
    Plus,
    Minus,
    History,
    User,
    LogOut,
    Box,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    Save,
    ChevronDown,
    Settings,
    ChefHat,
    Camera,
    X,
    Image as ImageIcon
} from "lucide-react";

// Mock data
const mockInventory = [
    { id: 1, name: "Premium Vodka", sku: "ALC-001", category: "Alcohol", quantity: 12, unit: "Bottle", image: null },
    { id: 2, name: "Napkins (White)", sku: "HK-042", category: "Housekeeping", quantity: 500, unit: "Pack", image: null },
    { id: 3, name: "Ribeye Steak", sku: "FD-104", category: "Food", quantity: 5, unit: "kg", image: null },
    { id: 4, name: "Toilet Paper", sku: "HK-001", category: "Housekeeping", quantity: 120, unit: "Roll", image: null },
    { id: 5, name: "Red Wine", sku: "ALC-005", category: "Alcohol", quantity: 8, unit: "Bottle", image: null },
    { id: 6, name: "Olive Oil", sku: "FD-023", category: "Food", quantity: 15, unit: "Liter", image: null },
    { id: 7, name: "Champagne", sku: "ALC-012", category: "Alcohol", quantity: 3, unit: "Bottle", image: null },
    { id: 8, name: "Coffee Beans", sku: "BV-001", category: "Beverages", quantity: 25, unit: "kg", image: null },
];

const mockActions = [
    { id: 1, action: "Stock In", item: "Premium Vodka", quantity: 6, timestamp: "Today, 2:30 PM" },
    { id: 2, action: "Stock Out", item: "Ribeye Steak", quantity: 2, timestamp: "Today, 1:15 PM" },
    { id: 3, action: "Stock Out", item: "Napkins (White)", quantity: 50, timestamp: "Today, 11:00 AM" },
    { id: 4, action: "Stock In", item: "Coffee Beans", quantity: 10, timestamp: "Yesterday, 4:45 PM" },
    { id: 5, action: "Stock Out", item: "Red Wine", quantity: 3, timestamp: "Yesterday, 8:00 PM" },
];

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    unit: string;
    image: string | null;
}

interface UserData {
    name: string;
    email: string;
    role: string;
    pin?: string;
}

export default function StaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [locale, setLocale] = useState<Locale>("fr"); // Default to French
    const t = createTranslator(locale);
    const [searchQuery, setSearchQuery] = useState("");
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
    const [actions, setActions] = useState(mockActions);
    const [user, setUser] = useState<UserData>({
        name: "Staff User",
        email: "staff@hotel.com",
        role: "Employee",
        pin: "00000",
    });

    // Stock adjustment dialog
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<"in" | "out">("in");
    const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);

    // Quick select dialog
    const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);
    const [quickSelectType, setQuickSelectType] = useState<"in" | "out">("in");
    const [quickSearchQuery, setQuickSearchQuery] = useState("");

    // Profile edit
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedName, setEditedName] = useState(user.name);
    const [editedPin, setEditedPin] = useState(user.pin || "");

    // Add new item dialog
    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        unit: "Bottle",
        image: null as string | null
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            // Load user from localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser({
                    name: parsed.name || "Staff User",
                    email: parsed.email || "",
                    role: parsed.role === "ORG_EMPLOYEE" ? "Employee" : parsed.role,
                    pin: parsed.pin || "00000",
                });
                setEditedName(parsed.name || "Staff User");
                setEditedPin(parsed.pin || "00000");
            }

            // Load language preference from localStorage (default to French)
            const storedLocale = localStorage.getItem("locale") as Locale;
            if (storedLocale && (storedLocale === "en" || storedLocale === "fr")) {
                setLocale(storedLocale);
            }

            setLoading(false);
        }
    }, [router]);

    // Handle language change
    const handleLocaleChange = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem("locale", newLocale);
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventory.filter(item => item.quantity < 10).length;
    const categoriesCount = new Set(inventory.map(item => item.category)).size;

    const handleOpenAdjust = (item: InventoryItem, type: "in" | "out") => {
        setSelectedItem(item);
        setAdjustmentType(type);
        setAdjustmentQuantity(1);
        setIsAdjustDialogOpen(true);
    };

    const handleQuickSelect = (type: "in" | "out") => {
        setQuickSelectType(type);
        setQuickSearchQuery("");
        setIsQuickSelectOpen(true);
    };

    const handleQuickItemSelect = (item: InventoryItem) => {
        setIsQuickSelectOpen(false);
        handleOpenAdjust(item, quickSelectType);
    };

    const handleAdjustStock = () => {
        if (!selectedItem) return;

        const newQuantity = adjustmentType === "in"
            ? selectedItem.quantity + adjustmentQuantity
            : Math.max(0, selectedItem.quantity - adjustmentQuantity);

        setInventory(inv =>
            inv.map(item =>
                item.id === selectedItem.id
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        // Add to action history
        const newAction = {
            id: actions.length + 1,
            action: adjustmentType === "in" ? "Stock In" : "Stock Out",
            item: selectedItem.name,
            quantity: adjustmentQuantity,
            timestamp: "Just now",
        };
        setActions([newAction, ...actions]);

        setIsAdjustDialogOpen(false);
        setSelectedItem(null);
    };

    const handleSaveProfile = () => {
        setUser({ ...user, name: editedName, pin: editedPin });
        setIsEditingProfile(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleAddNewItem = () => {
        if (!newItem.name || !newItem.sku || !newItem.category) {
            return; // Basic validation
        }

        const itemToAdd = {
            id: inventory.length + 1,
            name: newItem.name,
            sku: newItem.sku,
            category: newItem.category,
            quantity: newItem.quantity,
            unit: newItem.unit,
            image: newItem.image
        };

        setInventory([...inventory, itemToAdd]);

        // Add to action history
        const newAction = {
            id: actions.length + 1,
            action: "Stock In",
            item: newItem.name,
            quantity: newItem.quantity,
            timestamp: "Just now",
        };
        setActions([newAction, ...actions]);

        // Reset form
        setNewItem({
            name: "",
            sku: "",
            category: "",
            quantity: 0,
            unit: "Bottle",
            image: null
        });
        setIsAddItemDialogOpen(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem({ ...newItem, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setNewItem({ ...newItem, image: null });
    };

    const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();

    if (loading) return null;

    return (
        <div className="h-full relative">
            {/* Main Content */}
            <main className="h-full bg-transparent min-h-screen">
                <div className="p-8 space-y-8">
                    {/* Header - matching owner dashboard style */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="flex items-center">
                                <div className="relative h-10 w-10 mr-3">
                                    <ChefHat className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        HotelStock
                                    </h1>
                                    <p className="text-xs text-muted-foreground">{t("staff.portal.title")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Status Indicator */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-500">{t("staff.status.online")}</span>
                            </div>

                            {/* Language Selector */}
                            <LanguageSelector
                                currentLocale={locale}
                                onLocaleChange={handleLocaleChange}
                            />

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-muted/50 rounded-lg"
                                    >
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={undefined} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col items-start">
                                            <span className="text-sm font-medium text-foreground">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.role}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setIsEditingProfile(true)}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{t("staff.actions.profile")}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{t("staff.actions.signOut")}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* QUICK ACTION SECTION */}
                    <div className="grid gap-3 md:grid-cols-2">
                        <button
                            onClick={() => handleQuickSelect("in")}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 md:p-4 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold">{t("staff.actions.stockIn")}</h3>
                                    <p className="text-green-100 text-xs">{t("staff.inventory.subtitle")}</p>
                                </div>
                            </div>
                            <ArrowUpCircle className="absolute right-3 bottom-3 h-8 w-8 opacity-20" />
                        </button>

                        <button
                            onClick={() => handleQuickSelect("out")}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-3 md:p-4 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Minus className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold">{t("staff.actions.stockOut")}</h3>
                                    <p className="text-red-100 text-xs">{t("staff.inventory.subtitle")}</p>
                                </div>
                            </div>
                            <ArrowDownCircle className="absolute right-3 bottom-3 h-8 w-8 opacity-20" />
                        </button>
                    </div>

                    {/* Stats Grid - matching owner dashboard style */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t("staff.inventory.totalItems")}</CardTitle>
                                <Package className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">{t("staff.inventory.acrossCategories", { count: categoriesCount })}</p>
                            </CardContent>
                        </GlassCard>
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t("staff.inventory.lowStockItems")}</CardTitle>
                                <Box className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{lowStockCount}</div>
                                <p className="text-xs text-muted-foreground">{t("staff.inventory.belowThreshold")}</p>
                            </CardContent>
                        </GlassCard>
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t("staff.inventory.stockInsToday")}</CardTitle>
                                <ArrowUpCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{actions.filter(a => a.action === "Stock In").length}</div>
                                <p className="text-xs text-muted-foreground">{t("staff.inventory.itemsReceived")}</p>
                            </CardContent>
                        </GlassCard>
                        <GlassCard>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t("staff.inventory.stockOutsToday")}</CardTitle>
                                <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{actions.filter(a => a.action === "Stock Out").length}</div>
                                <p className="text-xs text-muted-foreground">{t("staff.inventory.itemsUsed")}</p>
                            </CardContent>
                        </GlassCard>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="inventory" className="w-full">
                        <TabsList className="bg-background/50 border border-input text-muted-foreground">
                            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <Package className="h-4 w-4 mr-2" /> {t("staff.tabs.inventory")}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <History className="h-4 w-4 mr-2" /> {t("staff.tabs.history")}
                            </TabsTrigger>
                            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <User className="h-4 w-4 mr-2" /> {t("staff.tabs.profile")}
                            </TabsTrigger>
                        </TabsList>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="mt-6">
                            <GlassCard>
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>{t("staff.inventory.title")}</CardTitle>
                                            <CardDescription>{t("staff.inventory.subtitle")}</CardDescription>
                                        </div>
                                        <div className="relative w-full md:w-80">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder={t("staff.inventory.searchPlaceholder")}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 bg-background/50 border-input"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableHead className="text-muted-foreground">{t("staff.inventory.item")}</TableHead>
                                                <TableHead className="text-muted-foreground hidden md:table-cell">{t("staff.inventory.sku")}</TableHead>
                                                <TableHead className="text-muted-foreground hidden md:table-cell">{t("staff.inventory.category")}</TableHead>
                                                <TableHead className="text-muted-foreground text-right">{t("staff.inventory.quantity")}</TableHead>
                                                <TableHead className="text-muted-foreground text-right">{t("staff.inventory.actions")}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInventory.map((item) => (
                                                <TableRow key={item.id} className="border-border hover:bg-muted/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-border"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                                                                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-foreground">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground md:hidden">{item.sku}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-sm">
                                                        {item.sku}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                                            {item.category}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-bold ${item.quantity < 10 ? 'text-yellow-500' : 'text-foreground'}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                                                                onClick={() => handleOpenAdjust(item, "in")}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                                                                onClick={() => handleOpenAdjust(item, "out")}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {filteredInventory.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>{t("staff.inventory.noItems")} "{searchQuery}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </GlassCard>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="mt-6">
                            <GlassCard>
                                <CardHeader>
                                    <CardTitle>{t("staff.history.title")}</CardTitle>
                                    <CardDescription>{t("staff.history.subtitle")}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {actions.map((action) => (
                                            <div key={action.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                                                <div className={`p-2 rounded-full ${action.action === "Stock In"
                                                    ? "bg-green-500/10"
                                                    : "bg-red-500/10"
                                                    }`}>
                                                    {action.action === "Stock In"
                                                        ? <ArrowUpCircle className="h-5 w-5 text-green-500" />
                                                        : <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">{action.item}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {action.action === "Stock In" ? "+" : "-"}{action.quantity} {t("staff.history.units")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {action.timestamp}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {actions.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>{t("staff.history.noActions")}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </GlassCard>
                        </TabsContent>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="mt-6">
                            <div className="max-w-xl">
                                <GlassCard>
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={undefined} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle>{user.name}</CardTitle>
                                                <CardDescription>{user.email}</CardDescription>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-500">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isEditingProfile ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-foreground">{t("staff.profile.fullName")}</Label>
                                                    <Input
                                                        id="name"
                                                        value={editedName}
                                                        onChange={(e) => setEditedName(e.target.value)}
                                                        className="bg-background/50 border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-foreground">{t("staff.profile.email")}</Label>
                                                    <Input
                                                        id="email"
                                                        value={user.email}
                                                        disabled
                                                        className="bg-background/30 opacity-50 border-input"
                                                    />
                                                    <p className="text-xs text-muted-foreground">{t("staff.profile.emailNote")}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pin" className="text-foreground">{t("staff.profile.pinCode")}</Label>
                                                    <Input
                                                        id="pin"
                                                        type="password"
                                                        value={editedPin}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                                                            setEditedPin(val);
                                                        }}
                                                        placeholder={t("staff.profile.pinPlaceholder")}
                                                        className="bg-background/50 border-input"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between py-3 border-b border-border">
                                                    <span className="text-muted-foreground">{t("staff.profile.email")}</span>
                                                    <span className="font-mono text-foreground">{user.email}</span>
                                                </div>
                                                <div className="flex justify-between py-3 border-b border-border">
                                                    <span className="text-muted-foreground">{t("staff.profile.role")}</span>
                                                    <span className="text-foreground">{user.role}</span>
                                                </div>
                                                <div className="flex justify-between py-3 border-b border-border">
                                                    <span className="text-muted-foreground">{t("staff.profile.pinCode")}</span>
                                                    <span className="font-mono text-foreground">•••••</span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        {isEditingProfile ? (
                                            <>
                                                <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="border-input">
                                                    {t("common.cancel")}
                                                </Button>
                                                <Button onClick={handleSaveProfile} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                    <Save className="h-4 w-4 mr-2" /> {t("staff.actions.saveChanges")}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button onClick={() => setIsEditingProfile(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                {t("staff.actions.editProfile")}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </GlassCard>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Stock Adjustment Dialog */}
            <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-background/95 border-border backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {adjustmentType === "in" ? t("staff.actions.stockIn") : t("staff.actions.stockOut")}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedItem && (
                                <>
                                    {adjustmentType === "in" ? t("staff.dialog.adjust.addStock") : t("staff.dialog.adjust.removeStock")}{" "}
                                    <strong>{selectedItem.name}</strong>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4 space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">{t("staff.dialog.adjust.currentStock")}</p>
                                <p className="text-3xl font-bold text-foreground">
                                    {selectedItem.quantity} <span className="text-sm font-normal text-muted-foreground">{selectedItem.unit}</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 border-input"
                                    onClick={() => setAdjustmentQuantity(Math.max(1, adjustmentQuantity - 1))}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={adjustmentQuantity}
                                        onChange={(e) => setAdjustmentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="text-center text-2xl font-bold h-12 bg-background/50 border-input"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 border-input"
                                    onClick={() => setAdjustmentQuantity(adjustmentQuantity + 1)}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">{t("staff.dialog.adjust.newStockLevel")}</p>
                                <p className={`text-2xl font-bold ${adjustmentType === "in" ? "text-green-500" : "text-red-500"}`}>
                                    {adjustmentType === "in"
                                        ? selectedItem.quantity + adjustmentQuantity
                                        : Math.max(0, selectedItem.quantity - adjustmentQuantity)
                                    } {selectedItem.unit}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)} className="border-input">
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleAdjustStock}
                            className={adjustmentType === "in"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }
                        >
                            {adjustmentType === "in" ? (
                                <><Plus className="h-4 w-4 mr-2" /> {t("staff.dialog.adjust.addStock")}</>
                            ) : (
                                <><Minus className="h-4 w-4 mr-2" /> {t("staff.dialog.adjust.removeStock")}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Quick Select Item Dialog */}
            <Dialog open={isQuickSelectOpen} onOpenChange={setIsQuickSelectOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] bg-background/95 border-border backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {quickSelectType === "in" ? (
                                <><ArrowUpCircle className="h-5 w-5 text-green-500" /> {t("staff.actions.stockIn")}</>
                            ) : (
                                <><ArrowDownCircle className="h-5 w-5 text-red-500" /> {t("staff.actions.stockOut")}</>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {quickSelectType === "in"
                                ? t("staff.dialog.stockIn.description")
                                : t("staff.dialog.stockOut.description")
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {/* Add New Item Link - Only for Stock In */}
                        {quickSelectType === "in" && (
                            <button
                                onClick={() => {
                                    setIsQuickSelectOpen(false);
                                    setIsAddItemDialogOpen(true);
                                    setNewItem({
                                        name: "",
                                        sku: "",
                                        category: "",
                                        quantity: 0,
                                        unit: "Bottle",
                                        image: null
                                    });
                                }}
                                className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-foreground">{t("staff.actions.addNewItem")}</p>
                                    <p className="text-xs text-muted-foreground">{t("staff.actions.createItem")}</p>
                                </div>
                            </button>
                        )}

                        {/* Divider */}
                        {quickSelectType === "in" && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground uppercase">{t("staff.actions.searchExisting")}</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t("staff.dialog.stockIn.searchItems")}
                                value={quickSearchQuery}
                                onChange={(e) => setQuickSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50 border-input"
                                autoFocus={quickSelectType !== "in"}
                            />
                        </div>

                        {/* Item List */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {inventory
                                .filter(item =>
                                    item.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                                    item.sku.toLowerCase().includes(quickSearchQuery.toLowerCase())
                                )
                                .map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleQuickItemSelect(item)}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99] ${quickSelectType === "in"
                                            ? "border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40"
                                            : "border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-border"
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${quickSelectType === "in" ? "bg-green-500/10" : "bg-red-500/10"
                                                    }`}>
                                                    <Package className={`h-6 w-6 ${quickSelectType === "in" ? "text-green-500" : "text-red-500"
                                                        }`} />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <p className="font-medium text-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${item.quantity < 10 ? 'text-yellow-500' : 'text-foreground'}`}>
                                                {item.quantity}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.unit}</p>
                                        </div>
                                    </button>
                                ))}

                            {/* Show "Add New Item" option when no items match and Stock In is selected */}
                            {quickSelectType === "in" && quickSearchQuery && inventory.filter(item =>
                                item.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                                item.sku.toLowerCase().includes(quickSearchQuery.toLowerCase())
                            ).length === 0 && (
                                <button
                                    onClick={() => {
                                        setIsQuickSelectOpen(false);
                                        setIsAddItemDialogOpen(true);
                                        setNewItem({
                                            name: quickSearchQuery,
                                            sku: "",
                                            category: "",
                                            quantity: 0,
                                            unit: "Bottle",
                                            image: null
                                        });
                                    }}
                                    className="w-full flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
                                >
                                    <div className="p-2 rounded-lg bg-primary/20">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">Add "{quickSearchQuery}"</p>
                                        <p className="text-xs text-muted-foreground">Not found - click to create new item</p>
                                    </div>
                                </button>
                            )}

                            {/* No results message for Stock Out */}
                            {quickSelectType === "out" && quickSearchQuery && inventory.filter(item =>
                                item.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                                item.sku.toLowerCase().includes(quickSearchQuery.toLowerCase())
                            ).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No items found</p>
                                    <p className="text-xs">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add New Item Dialog */}
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background/95 border-border backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {t("staff.dialog.addItem.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("staff.dialog.addItem.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <Label className="text-foreground">{t("staff.dialog.addItem.itemPhoto")}</Label>
                            <div className="flex items-center gap-4">
                                {newItem.image ? (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted">
                                        <img
                                            src={newItem.image}
                                            alt="Item preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground transition-colors"
                                            type="button"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image-upload"
                                        className="w-24 h-24 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 cursor-pointer flex flex-col items-center justify-center transition-all group"
                                    >
                                        <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-xs text-muted-foreground mt-1">{t("staff.dialog.addItem.upload")}</span>
                                    </label>
                                )}
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        {newItem.image ? t("staff.dialog.addItem.removePhoto") : t("staff.dialog.addItem.uploadPhoto")}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t("staff.dialog.addItem.photoRecommendation")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item-name" className="text-foreground">{t("staff.dialog.addItem.itemName")} *</Label>
                            <Input
                                id="item-name"
                                placeholder={t("staff.dialog.addItem.itemNamePlaceholder")}
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="bg-background/50 border-input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="item-sku" className="text-foreground">{t("staff.inventory.sku")} *</Label>
                                <Input
                                    id="item-sku"
                                    placeholder={t("staff.dialog.addItem.skuPlaceholder")}
                                    value={newItem.sku}
                                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                                    className="bg-background/50 border-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-category" className="text-foreground">{t("staff.inventory.category")} *</Label>
                                <Input
                                    id="item-category"
                                    placeholder={t("staff.dialog.addItem.categoryPlaceholder")}
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="bg-background/50 border-input"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="item-quantity" className="text-foreground">{t("staff.dialog.addItem.initialQuantity")}</Label>
                                <Input
                                    id="item-quantity"
                                    type="number"
                                    min="0"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                    className="bg-background/50 border-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-unit" className="text-foreground">{t("staff.dialog.addItem.unit")}</Label>
                                <select
                                    id="item-unit"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="Bottle">{t("staff.units.bottle")}</option>
                                    <option value="kg">{t("staff.units.kg")}</option>
                                    <option value="Liter">{t("staff.units.liter")}</option>
                                    <option value="Pack">{t("staff.units.pack")}</option>
                                    <option value="Roll">{t("staff.units.roll")}</option>
                                    <option value="Box">{t("staff.units.box")}</option>
                                    <option value="Unit">{t("staff.units.unit")}</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("staff.dialog.addItem.requiredFields")}</p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddItemDialogOpen(false)}
                            className="border-input"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleAddNewItem}
                            disabled={!newItem.name || !newItem.sku || !newItem.category}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("staff.actions.addItem")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col gap-3">
                <Button
                    onClick={() => handleQuickSelect("out")}
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all"
                    size="icon"
                >
                    <Minus className="h-6 w-6" />
                </Button>
                <Button
                    onClick={() => handleQuickSelect("in")}
                    className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
                    size="icon"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </div>
        </div>
    );
}
