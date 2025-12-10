"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, Filter, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

const mockTransactions = [
    { id: 1, type: "OUT_USE", item: "Premium Vodka", user: "John Doe", quantity: -2, date: "2023-10-25 14:30" },
    { id: 2, type: "IN", item: "Napkins (White)", user: "Admin", quantity: 1000, date: "2023-10-25 10:00" },
    { id: 3, type: "OUT_WASTE", item: "Ribeye Steak", user: "Jane Chef", quantity: -1, date: "2023-10-24 22:15" },
    { id: 4, type: "IN", item: "Toilet Paper", user: "Admin", quantity: 50, date: "2023-10-24 09:00" },
    { id: 5, type: "AUDIT", item: "Red Wine", user: "Manager", quantity: 0, date: "2023-10-23 18:00" },
];

export default function TransactionsPage() {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-transparent min-h-screen text-foreground">
                <div className="p-8 space-y-8">
                    <Header title="Transactions" subtitle="History of all stock movements" />

                    <div className="flex items-center justify-between -mt-4">
                        <div></div>
                        <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                            <History className="mr-2 h-4 w-4" /> Export Log
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground" placeholder="Search transactions..." />
                        </div>
                        <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>

                    <GlassCard className="p-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Type</TableHead>
                                    <TableHead className="text-muted-foreground">Item</TableHead>
                                    <TableHead className="text-muted-foreground">User</TableHead>
                                    <TableHead className="text-muted-foreground">Quantity</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTransactions.map((tx) => (
                                    <TableRow key={tx.id} className="border-border hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'IN' && <ArrowDownLeft className="h-4 w-4 text-green-500" />}
                                                {tx.type.startsWith('OUT') && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                                                {tx.type === 'AUDIT' && <History className="h-4 w-4 text-yellow-500" />}
                                                <span className={
                                                    tx.type === 'IN' ? 'text-green-400' :
                                                        tx.type.startsWith('OUT') ? 'text-red-400' : 'text-yellow-400'
                                                }>
                                                    {tx.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">{tx.item}</TableCell>
                                        <TableCell className="text-muted-foreground">{tx.user}</TableCell>
                                        <TableCell className={`font-mono ${tx.quantity > 0 ? 'text-green-400' : tx.quantity < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                            {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{tx.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
}
