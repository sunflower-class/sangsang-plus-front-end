import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type Notification } from '@/services/notificationService';
import useProductDetails from '@/hooks/useProductDetails';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchProductDetails: (dataUrl: string) => Promise<any>;
  handleNotificationClick: (notification: Notification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const { fetchByUrl } = useProductDetails();

  useEffect(() => {
    if (!user?.id) return;

    notificationService.setUserId(user.id);
    notificationService.setCallbacks({
      onNotificationReceived: (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 19)]);
        
        if (notification.data_url && notification.message_type === 'success') {
          handleNotificationWithData(notification);
        }
      },
      onUnreadCountChanged: setUnreadCount,
      onConnectionStateChanged: setIsConnected,
    });

    const initializeNotifications = async () => {
      await notificationService.requestNotificationPermission();
      notificationService.connect();
      
      const response = await notificationService.fetchNotifications();
      if (response?.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    };

    initializeNotifications();

    // 토큰 refresh 이벤트 리스너 추가
    const handleTokenRefresh = (event: CustomEvent) => {
      console.log('🔄 토큰이 갱신되었습니다. SSE 재연결 중...');
      // SSE 재연결
      notificationService.disconnect();
      setTimeout(() => {
        notificationService.connect();
      }, 100); // 짧은 지연 후 재연결
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener);

    return () => {
      notificationService.disconnect();
      window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
    };
  }, [user?.id]);

  const handleNotificationWithData = async (notification: Notification) => {
    console.log('🔔 알림 데이터 처리 시작:', notification);
    
    if (notification.service_type === 'product-details' && notification.data_url) {
      // data_url에서 상세페이지 ID 추출 (예: /api/generation/product-details/20 -> 20)
      const urlMatch = notification.data_url.match(/\/product-details\/(\d+)/);
      const productId = urlMatch ? urlMatch[1] : null;
      
      console.log('📍 추출된 상품 ID:', productId);
      
      if (productId) {
        setTimeout(() => {
          const shouldNavigate = confirm(
            `${notification.title}\n상품 상세페이지가 생성되었습니다. 에디터에서 확인하시겠습니까?`
          );
          console.log('👤 사용자 응답:', shouldNavigate);
          
          if (shouldNavigate) {
            console.log('🚀 에디터로 이동 중... Product ID:', productId);
            // 상품 ID로 에디터 페이지 이동
            navigate(`/editor/${productId}`);
          }
        }, 1000);
      } else {
        console.log('❌ data_url에서 상품 ID를 추출할 수 없음:', notification.data_url);
        
        if (notification.action_url) {
          console.log('🔗 action_url로 폴백:', notification.action_url);
          setTimeout(() => {
            const shouldNavigate = confirm(
              `${notification.title}\n결과를 확인하시겠습니까?`
            );
            if (shouldNavigate) {
              window.open(notification.action_url, '_blank');
            }
          }, 1000);
        } else {
          console.log('⚠️ action_url도 없음');
        }
      }
    } else {
      console.log('⚠️ 알림 처리 조건 불만족:', {
        service_type: notification.service_type,
        has_data_url: !!notification.data_url
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.event_id === notificationId ? { ...n, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.event_id !== notificationId));
    }
  };

  const fetchProductDetails = async (dataUrl: string) => {
    if (!user?.id) return null;
    return await fetchByUrl(dataUrl, user.id);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    deleteNotification,
    fetchProductDetails,
    handleNotificationClick: handleNotificationWithData,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;