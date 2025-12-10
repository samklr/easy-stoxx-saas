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
import { ChefHat, Building2, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Tenant Info, 2: User Info

    const [formData, setFormData] = useState({
        companyName: "",
        name: "",
        email: "",
        password: ""
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock registration
            console.log("Registering", formData);
            await new Promise(r => setTimeout(r, 1000)); // Simulate API
            localStorage.setItem("token", "mock-jwt-token");
            router.push("/");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-lg p-4">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary/10 mb-4 shadow-xl">
                        <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Join HotelStock
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Start managing your hospitality business today
                    </p>
                </div>

                <GlassCard>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {step === 1 ? "Tell us about your organization" : "Setup your admin account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">

                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-foreground">Hotel / Restaurant Name</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="companyName"
                                                placeholder="Grand Budapest Hotel"
                                                className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => formData.companyName ? setStep(2) : null}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Next Step
                                    </Button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-foreground">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="Gustave H."
                                                className="pl-9 bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground">Work Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="gustave@grandbudapest.com"
                                            className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-foreground">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-transparent border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                                            disabled={loading}
                                        >
                                            {loading ? "Creating..." : "Create Account"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </form>
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </GlassCard>
            </div>
        </div>
    );
}
