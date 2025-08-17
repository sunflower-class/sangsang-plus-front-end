import React from 'react';
import { CheckCircle, X, ExternalLink, Loader2, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Separator } from '@/components/ui/layout/separator';
import { Badge } from '@/components/ui/data-display/badge';
import { cn } from '@/lib/utils';
import { type Notification } from '@/services/notificationService';
import { useNotifications } from './NotificationProvider';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  isConnected: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  isConnected,
) => {
  const { handleNotificationClick } = useNotifications();
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return notificationTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (notifications.length === 0) {
    return (
      <div className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">알림</h3>
          <div className="flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">새로운 알림이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">알림</h3>
        <div className="flex items-center space-x-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? '연결됨' : '연결 안됨'}
          </span>
        </div>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-2">
          {notifications.map((notification, index) => (
            <div key={notification.event_id}>
              <div
                className={cn(
                  "group relative p-3 rounded-lg hover:bg-muted/50 transition-colors",
                  notification.status === 'unread' && "bg-blue-50/50 dark:bg-blue-900/10"
                )}
              >
                {notification.status === 'unread' && (
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
                
                <div className="flex items-start space-x-3 ml-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getMessageTypeIcon(notification.message_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {notification.service_type && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {notification.service_type}
                            </Badge>
                          )}
                        </div>
                        
                        {notification.action_url && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async () => {
                                console.log('🔔 알림 버튼 클릭:', notification);
                                
                                if (notification.status === 'unread') {
                                  onMarkAsRead(notification.event_id);
                                }
                                
                                // NotificationProvider의 통합 핸들러 사용
                                await handleNotificationClick(notification);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {notification.action_label || '자세히 보기'}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.status === 'unread' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onMarkAsRead(notification.event_id)}
                            title="읽음으로 표시"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(notification.event_id)}
                          title="삭제"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < notifications.length - 1 && (
                <Separator className="my-1" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;