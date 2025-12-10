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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Search, Pencil, Trash2, Save, KeyRound } from "lucide-react";
import { useState } from "react";

// Mock user data
const initialUsers = [
    { id: 1, name: "Gustave H.", email: "gustave@grandbudapest.com", role: "Owner", pin: "12345", status: "Active" },
    { id: 2, name: "Zero Moustafa", email: "zero@grandbudapest.com", role: "Employee", pin: "54321", status: "Active" },
    { id: 3, name: "Jane Chef", email: "jane@grandbudapest.com", role: "Employee", pin: "11111", status: "Active" },
    { id: 4, name: "Mike Storage", email: "mike@grandbudapest.com", role: "Employee", pin: "22222", status: "Inactive" },
];

type User = typeof initialUsers[0];

export default function UsersPage() {
    const [users, setUsers] = useState(initialUsers);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Employee",
        pin: "",
        status: "Active",
    });

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({
            name: "",
            email: "",
            role: "Employee",
            pin: "",
            status: "Active",
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            pin: user.pin,
            status: user.status,
        });
        setIsDialogOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate PIN is 5 digits
        if (!/^\d{5}$/.test(formData.pin)) {
            alert("PIN must be exactly 5 digits");
            return;
        }

        if (editingUser) {
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...formData, id: u.id } : u)));
        } else {
            setUsers([...users, { ...formData, id: Date.now() }]);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };

    const generateRandomPin = () => {
        const pin = Math.floor(10000 + Math.random() * 90000).toString();
        setFormData({ ...formData, pin });
    };

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-transparent min-h-screen text-foreground">
                <div className="p-8 space-y-8">
                    <Header title="Users" subtitle="Manage team members and access" />

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-background/50 border-input"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleOpenAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </div>

                    {/* Users Table */}
                    <GlassCard className="p-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-muted-foreground">Email</TableHead>
                                    <TableHead className="text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-muted-foreground">PIN</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => handleOpenEdit(user)}
                                    >
                                        <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "Owner"
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-blue-500/20 text-blue-400"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-muted-foreground">
                                            {user.pin.replace(/./g, "•")}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEdit(user);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(user.id);
                                                    }}
                                                    disabled={user.role === "Owner"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </GlassCard>

                    {/* User Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-[450px] bg-background/95 border-border backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                                <DialogDescription>
                                    {editingUser ? "Update user information and access." : "Create a new team member account."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSave} className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background/50"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-background/50"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Owner">Owner</SelectItem>
                                                <SelectItem value="Employee">Employee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pin">PIN Code (5 digits)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="pin"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d{5}"
                                            maxLength={5}
                                            value={formData.pin}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                                                setFormData({ ...formData, pin: val });
                                            }}
                                            className="bg-background/50 font-mono text-lg tracking-widest"
                                            placeholder="•••••"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateRandomPin}
                                            className="shrink-0"
                                        >
                                            <KeyRound className="h-4 w-4 mr-2" />
                                            Generate
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This PIN will be used by the employee to log in.
                                    </p>
                                </div>

                                <DialogFooter className="mt-4">
                                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                                        <Save className="mr-2 h-4 w-4" />
                                        {editingUser ? "Save Changes" : "Create User"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </div>
    );
}
