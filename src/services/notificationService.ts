import { toast } from 'sonner';

export interface Notification {
  event_id: string;
  service_type: string;
  message_type: 'success' | 'error' | 'info' | 'warning';
  user_id: string;
  title: string;
  message: string;
  status: 'read' | 'unread';
  created_at: string;
  action_url?: string;
  action_label?: string;
  data_url?: string;
  data_id?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
    total_returned: number;
    limit: number;
    offset: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // 재연결 시도 횟수 증가
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onNotificationReceived?: (notification: Notification) => void;
  private onUnreadCountChanged?: (count: number) => void;
  private onConnectionStateChanged?: (connected: boolean) => void;

  constructor() {
    this.getBaseUrl = this.getBaseUrl.bind(this);
  }

  getBaseUrl(): string {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8080';
    } else {
      return 'https://oauth.buildingbite.com';
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setCallbacks(callbacks: {
    onNotificationReceived?: (notification: Notification) => void;
    onUnreadCountChanged?: (count: number) => void;
    onConnectionStateChanged?: (connected: boolean) => void;
  }) {
    this.onNotificationReceived = callbacks.onNotificationReceived;
    this.onUnreadCountChanged = callbacks.onUnreadCountChanged;
    this.onConnectionStateChanged = callbacks.onConnectionStateChanged;
  }

  connect() {
    if (!this.userId) {
      console.error('User ID가 설정되지 않았습니다.');
      return;
    }

    // 기존 연결이 있으면 정리
    this.disconnect();

    // JWT 토큰을 URL 파라미터로 추가
    const token = localStorage.getItem('jwt_token');
    const baseUrl = `${this.getBaseUrl()}/api/notifications/stream/${this.userId}`;
    const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
    
    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ 실시간 알림 연결 성공');
        this.reconnectAttempts = 0;
        this.onConnectionStateChanged?.(true);
        
        // 성공 시 재연결 타이머 정리
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNotification(data);
        } catch (error) {
          console.error('알림 데이터 파싱 오류:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.warn('⚠️ SSE 연결 오류 발생, 재연결 준비 중...', error);
        this.onConnectionStateChanged?.(false);
        
        // EventSource의 readyState 확인
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('SSE 연결이 닫혔습니다. 재연결을 시도합니다.');
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error('SSE 연결 생성 실패:', error);
      this.handleReconnect();
    }
  }

  private handleNotification(data: any) {
    switch (data.type) {
      case 'connected':
        console.log('연결됨:', data.user_id);
        break;
        
      case 'notification':
        this.showNotification(data.data);
        this.updateNotificationCount();
        break;
        
      case 'keepalive':
        break;
        
      case 'error':
        console.error('서버 오류:', data.message);
        break;
    }
  }

  private showNotification(notification: Notification) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.event_id
      });
    }

    toast[notification.message_type](notification.title, {
      description: notification.message,
      action: notification.action_url ? {
        label: notification.action_label || '자세히 보기',
        onClick: () => window.location.href = notification.action_url!
      } : undefined
    });

    this.onNotificationReceived?.(notification);
    
    if (notification.data_url && notification.message_type === 'success') {
      this.fetchNotificationData(notification);
    }
  }

  async fetchNotificationData(notification: Notification) {
    try {
      // JWT 토큰은 axios 인터셉터에서 자동으로 추가됨
      // Spring Gateway에서 JWT를 파싱해서 X-User-Id를 다운스트림으로 전달
      const response = await fetch(notification.data_url!);
      
      if (response.ok) {
        const data = await response.json();
        console.log('알림 데이터 조회 성공:', data);
        this.handleNotificationData(notification, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('알림 데이터 조회 실패:', error);
      return null;
    }
  }

  private handleNotificationData(notification: Notification, data: any) {
    if (notification.service_type === 'product-details') {
      console.log('상품 상세 정보:', data);
      // NotificationProvider에서 처리하므로 여기서는 로그만 출력
    }
  }

  private handleReconnect() {
    // 기존 타이머가 있으면 정리
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // 지수 백오프, 하지만 최대 5초로 제한
      const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 5000);
      
      console.log(`재연결 시도 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} (${delay}ms 후)`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('최대 재연결 시도 횟수에 도달했습니다. SSE 연결을 포기합니다.');
      this.onConnectionStateChanged?.(false);
    }
  }

  disconnect() {
    // 재연결 타이머 정리
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.onConnectionStateChanged?.(false);
    }
    
    // 재연결 시도 카운터 리셋
    this.reconnectAttempts = 0;
  }

  async fetchNotifications(limit = 20, offset = 0): Promise<NotificationResponse | null> {
    if (!this.userId) return null;

    try {
      const response = await fetch(
        `${this.getBaseUrl()}/api/notifications/${this.userId}?limit=${limit}&offset=${offset}`
      );
      return await response.json();
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      return null;
    }
  }

  async updateNotificationCount(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await fetch(`${this.getBaseUrl()}/api/notifications/${this.userId}/unread-count`);
      const data: UnreadCountResponse = await response.json();
      
      if (data.success) {
        this.onUnreadCountChanged?.(data.data.unread_count);
      }
    } catch (error) {
      console.error('알림 개수 업데이트 실패:', error);
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const response = await fetch(
        `${this.getBaseUrl()}/api/notifications/${notificationId}/read?user_id=${this.userId}`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        this.updateNotificationCount();
        return true;
      }
      return false;
    } catch (error) {
      console.error('읽음 처리 실패:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const response = await fetch(
        `${this.getBaseUrl()}/api/notifications/${notificationId}?user_id=${this.userId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        this.updateNotificationCount();
        return true;
      }
      return false;
    } catch (error) {
      console.error('삭제 실패:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

export const notificationService = new NotificationService();
export default notificationService;