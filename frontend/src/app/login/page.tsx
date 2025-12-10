"use client";

import { Button } from "@/components/ui/button";
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if user exists in the database and get their role
            const response = await fetch(`http://localhost:8080/api/users`);
            const users = await response.json();

            // Find user by email
            const user = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());

            if (user) {
                // Store user info for role-based routing
                localStorage.setItem("token", "mock-jwt-token");
                localStorage.setItem("user", JSON.stringify(user));

                // Redirect based on role
                if (user.role === "ORG_EMPLOYEE") {
                    router.push("/staff");
                } else {
                    // ORG_OWNER or PLATFORM_ADMIN go to main dashboard
                    router.push("/");
                }
            } else {
                // For demo purposes, allow any login with mock data
                // In production, this would show an error
                console.log("User not found, using mock login");
                localStorage.setItem("token", "mock-jwt-token");
                localStorage.setItem("user", JSON.stringify({
                    name: "Demo User",
                    email: email,
                    role: "ORG_OWNER"
                }));
                router.push("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            // Fallback to basic mock login
            localStorage.setItem("token", "mock-jwt-token");
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-md p-4">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary/10 mb-4 shadow-xl">
                        <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        HotelStock
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Premium Inventory Management
                    </p>
                </div>

                <GlassCard>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Sign In
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        placeholder="name@hotel.com"
                                        type="email"
                                        className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground">Password</Label>
                                    <Link
                                        href="#"
                                        className="text-xs text-primary hover:text-primary/80"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 border-0"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                                Google
                            </Button>
                            <Button variant="outline" className="bg-background/50 border-input text-foreground hover:bg-accent hover:text-accent-foreground">
                                Facebook
                            </Button>
                        </div>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                                Onboard Hotel
                            </Link>
                        </div>
                    </CardContent>
                </GlassCard>
            </div>
        </div>
    );
}
