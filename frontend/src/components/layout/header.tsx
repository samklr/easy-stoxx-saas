"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

interface UserData {
    name: string;
    email: string;
    role: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserData>({
        name: "Guest User",
        email: "guest@hotel.com",
        role: "Guest",
    });

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser({
                name: parsed.name || "User",
                email: parsed.email || "",
                role: parsed.role === "ORG_OWNER" ? "Owner" :
                    parsed.role === "PLATFORM_ADMIN" ? "Admin" :
                        parsed.role === "ORG_EMPLOYEE" ? "Employee" : parsed.role,
            });

            // Redirect employees to staff page if they're on owner pages
            if (parsed.role === "ORG_EMPLOYEE") {
                router.push("/staff");
            }
        }
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();

    return (
        <div className="flex items-center justify-between mb-8">
            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>

            {/* User Profile Section */}
            <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-500">Online</span>
                </div>

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
                            onClick={() => router.push("/settings")}
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push("/settings")}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
