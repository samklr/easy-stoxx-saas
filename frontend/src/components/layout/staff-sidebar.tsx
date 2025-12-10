"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    Settings,
    ChefHat,
} from "lucide-react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/staff",
        color: "text-primary",
    },
    {
        label: "Inventory",
        icon: Package,
        href: "/staff",
        color: "text-primary",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/staff",
        color: "text-primary",
    },
];

export function StaffSidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="px-3 py-2 flex-1">
                <Link href="/staff" className="flex items-center pl-3 mb-14">
                    <div className="relative h-8 w-8 mr-4">
                        <ChefHat className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            HotelStock
                        </h1>
                        <p className="text-xs text-muted-foreground">Staff Portal</p>
                    </div>
                </Link>
                <div className="space-y-1">
                    {routes.map((route, index) => (
                        <Link
                            key={index}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition",
                                pathname === route.href
                                    ? "text-sidebar-accent-foreground bg-sidebar-accent"
                                    : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
