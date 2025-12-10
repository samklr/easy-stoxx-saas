"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, CreditCard, Users, Save, Coins, Check } from "lucide-react";

type CurrencyCode = "EUR" | "XAF" | "USD";

const currencies = {
    EUR: { symbol: "€", name: "Euro" },
    XAF: { symbol: "FCFA", name: "CFA Franc" },
    USD: { symbol: "$", name: "US Dollar" },
};

export default function SettingsPage() {
    const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("EUR");
    const [saved, setSaved] = useState(false);

    // Load saved currency on mount
    useEffect(() => {
        const savedCurrency = localStorage.getItem("defaultCurrency") as CurrencyCode;
        if (savedCurrency && currencies[savedCurrency]) {
            setDefaultCurrency(savedCurrency);
        }
    }, []);

    const handleSaveCurrency = () => {
        localStorage.setItem("defaultCurrency", defaultCurrency);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-transparent min-h-screen text-foreground">
                <div className="p-8 space-y-8">
                    <Header title="Settings" subtitle="Manage your organization and preferences" />

                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="bg-background/50 border border-input text-muted-foreground">
                            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <Building2 className="mr-2 h-4 w-4" /> General
                            </TabsTrigger>
                            <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <Users className="mr-2 h-4 w-4" /> Team
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <CreditCard className="mr-2 h-4 w-4" /> Billing
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 mt-6">
                            {/* Organization Details */}
                            <GlassCard>
                                <CardHeader>
                                    <CardTitle>Organization Details</CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Update your hotel or restaurant information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="orgName" className="text-foreground">Organization Name</Label>
                                        <Input id="orgName" defaultValue="Grand Budapest Hotel" className="bg-background/50 border-input text-foreground" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-foreground">Contact Email</Label>
                                        <Input id="email" defaultValue="contact@grandbudapest.com" className="bg-background/50 border-input text-foreground" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </Button>
                                </CardFooter>
                            </GlassCard>

                            {/* Currency Settings */}
                            <GlassCard>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-5 w-5 text-primary" />
                                        <div>
                                            <CardTitle>Default Currency</CardTitle>
                                            <CardDescription className="text-muted-foreground">
                                                Set the default currency for reports and inventory values
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="currency" className="text-foreground">Currency</Label>
                                        <Select
                                            value={defaultCurrency}
                                            onValueChange={(val) => setDefaultCurrency(val as CurrencyCode)}
                                        >
                                            <SelectTrigger className="w-full max-w-xs bg-background/50 border-input">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EUR">
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-mono">€</span> Euro (EUR)
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="XAF">
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-mono">FCFA</span> CFA Franc (XAF)
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="USD">
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-mono">$</span> US Dollar (USD)
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            This will be used as the default across all reports and inventory pages.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleSaveCurrency}
                                        className={saved ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"}
                                    >
                                        {saved ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" /> Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> Save Currency
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </GlassCard>
                        </TabsContent>

                        <TabsContent value="team" className="space-y-4 mt-6">
                            <GlassCard>
                                <CardHeader>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Manage who has access to your inventory
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/40 border border-border">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src="/placeholder.png" />
                                                <AvatarFallback>GH</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">Gustave H.</p>
                                                <p className="text-sm text-muted-foreground">Admin</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-input text-muted-foreground hover:text-foreground">Manage</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/40 border border-border">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src="/placeholder.png" />
                                                <AvatarFallback>ZM</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">Zero Moustafa</p>
                                                <p className="text-sm text-muted-foreground">Lobby Boy</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-input text-muted-foreground hover:text-foreground">Manage</Button>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full border-dashed border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                        + Invite New Member
                                    </Button>
                                </CardFooter>
                            </GlassCard>
                        </TabsContent>

                        <TabsContent value="billing" className="space-y-4 mt-6">
                            <GlassCard>
                                <CardHeader>
                                    <CardTitle>Subscription Plan</CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        You are currently on the Pro Plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">€49.00 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                                            <p className="text-sm text-green-400">Active until Dec 31, 2025</p>
                                        </div>
                                        <Button className="bg-foreground text-background hover:bg-foreground/90">Upgrade</Button>
                                    </div>
                                </CardContent>
                            </GlassCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
