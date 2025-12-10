"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Package } from "lucide-react";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { ChatWidget } from "@/components/ai/chat-widget";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Protect route
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full bg-transparent min-h-screen">
        <div className="p-8 space-y-8">
          <Header title="Dashboard" subtitle="Welcome back, here's your overview" />

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </GlassCard>
            <GlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items in Stock</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">across 14 categories</p>
              </CardContent>
            </GlassCard>
          </div>

          {/* Activity & Alerts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <RecentActivity />
            <LowStockAlerts />
          </div>

        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
