import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "@/components/ui/glass-card";

const activities = [
    {
        id: 1,
        user: {
            name: "Gustave H.",
            image: "/placeholder.png",
            initials: "GH"
        },
        action: "added 50 units of",
        target: "Premium Vodka",
        time: "2 minutes ago"
    },
    {
        id: 2,
        user: {
            name: "Zero Moustafa",
            image: "/placeholder.png",
            initials: "ZM"
        },
        action: "checked out",
        target: "Room 101 Keys",
        time: "15 minutes ago"
    },
    {
        id: 3,
        user: {
            name: "Gustave H.",
            image: "/placeholder.png",
            initials: "GH"
        },
        action: "updated inventory for",
        target: "Champagne 1928",
        time: "1 hour ago"
    },
    {
        id: 4,
        user: {
            name: "Admin System",
            image: "/placeholder.png",
            initials: "AS"
        },
        action: "generated report",
        target: "Weekly Waste Log",
        time: "3 hours ago"
    },
    {
        id: 5,
        user: {
            name: "Jane Chef",
            image: "/placeholder.png",
            initials: "JC"
        },
        action: "flagged low stock for",
        target: "Ribeye Steaks",
        time: "5 hours ago"
    }
];

export function RecentActivity() {
    return (
        <GlassCard>
            <div className="p-6 pb-4">
                <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Latest actions across your organization</p>
            </div>
            <div className="px-6 pb-6">
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                <AvatarImage src={activity.user.image} alt={activity.user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{activity.user.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">
                                    <span className="font-medium">{activity.user.name}</span>{" "}
                                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                                    <span className="font-medium text-primary">{activity.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}
