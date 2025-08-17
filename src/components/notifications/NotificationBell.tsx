import React, { useState } from 'react';
import { Bell, Dot } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/overlay/popover';
import NotificationList from './NotificationList';
import { useNotifications } from './NotificationProvider';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <Dot className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={5}
      >
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
          isConnected={isConnected}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;