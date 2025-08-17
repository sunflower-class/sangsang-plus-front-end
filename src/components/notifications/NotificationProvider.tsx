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

    return () => {
      notificationService.disconnect();
    };
  }, [user?.id]);

  const handleNotificationWithData = async (notification: Notification) => {
    console.log('🔔 알림 데이터 처리 시작:', notification);
    
    if (notification.service_type === 'product-details' && notification.data_url) {
      try {
        console.log('📡 데이터 URL에서 상품 데이터 가져오는 중:', notification.data_url);
        const productData = await fetchByUrl(notification.data_url, user?.id);
        console.log('📦 가져온 상품 데이터:', productData);
        
        if (productData && productData.html_list && productData.html_list.length > 0) {
          console.log('✅ HTML 데이터 발견, 에디터로 이동 준비');
          setTimeout(() => {
            const shouldNavigate = confirm(
              `${notification.title}\n상품 상세페이지가 생성되었습니다. 에디터에서 확인하시겠습니까?`
            );
            console.log('👤 사용자 응답:', shouldNavigate);
            
            if (shouldNavigate) {
              // HTML 데이터를 섹션별로 처리
              const processedHtml = productData.html_list.map((htmlBlock: string, index: number) => {
                return `<section id="block-${index}">${htmlBlock}</section>`;
              }).join('\n');
              
              console.log('🚀 에디터로 이동 중...');
              // React Router로 에디터 페이지로 이동
              navigate('/editor/new-page', { state: { generatedHtml: processedHtml } });
            }
          }, 1000);
        } else {
          console.log('❌ HTML 데이터가 없음. productData:', productData);
          
          if (notification.action_url) {
            console.log('🔗 action_url로 폴백:', notification.action_url);
            // 데이터가 없으면 기존 action_url로 이동
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
      } catch (error) {
        console.error('❌ Product details fetch failed:', error);
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