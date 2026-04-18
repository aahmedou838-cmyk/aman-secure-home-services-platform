import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Briefcase, Wallet, ShieldInfo, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
export function NotificationCenter() {
  const notifications = useQuery(api.notifications.getUnreadNotifications) ?? [];
  const markRead = useMutation(api.notifications.markAsRead);
  const markAllRead = useMutation(api.notifications.markAllAsRead);
  const getIcon = (type: string) => {
    switch (type) {
      case "new_request": return <Briefcase className="w-4 h-4 text-aman-teal" />;
      case "accepted": return <ShieldInfo className="w-4 h-4 text-aman-navy" />;
      case "quote_received": return <Wallet className="w-4 h-4 text-aman-amber" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-xl">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-aman-red text-[10px] text-white font-bold animate-in zoom-in">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="end" dir="rtl">
        <div className="bg-aman-navy p-4 flex items-center justify-between text-white">
          <h3 className="font-bold">التنبيهات</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllRead()}
            className="text-[10px] hover:bg-white/10 h-8"
          >
            تحديد الكل كمقروء
          </Button>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Check className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs">لا توجد تنبيهات جديدة</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors group relative"
                  onClick={() => markRead({ notificationId: n._id })}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold leading-tight">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-1 text-[8px] opacity-60">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ar })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 bg-muted/30 text-center">
          <Button variant="ghost" size="sm" className="text-[10px] w-full">عرض كل التنبيهات</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}