# 알림 서비스 프론트엔드 연동 가이드

## 개요
알림 서비스는 Server-Sent Events (SSE)를 사용하여 실시간 알림을 제공하며, REST API를 통해 알림 관리 기능을 제공합니다.

## API 엔드포인트

### 기본 URL
개발/운영 환경에 따라 다음 URL을 사용:

**개발 환경 (로컬):**
```
http://localhost:8080/api/notifications
```

**운영 환경:**
```
https://api.buildingbite.com/notifications/api/notifications
```
또는
```
https://oauth.buildingbite.com/notifications/api/notifications
```

> ⚠️ **중요**: 실제 배포된 notification-service의 외부 URL을 확인하여 사용해야 합니다. 
> Ingress나 Load Balancer 설정에 따라 경로가 달라질 수 있습니다.

### 1. 알림 목록 조회
```http
GET /api/notifications/{user_id}?limit=20&offset=0
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "event_id": "task_12345_completed",
        "service_type": "worker",
        "message_type": "success",
        "user_id": "user123",
        "title": "작업 완료",
        "message": "상품 데이터 분석이 완료되었습니다.",
        "status": "unread",
        "created_at": "2024-01-01T12:00:00",
        "action_url": "/results/12345",
        "action_label": "결과 보기",
        "data_url": "https://api.buildingbite.com/product-details/api/generation/product-details/12345",
        "data_id": "12345"
      }
    ],
    "unread_count": 5,
    "total_returned": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### 2. 읽지 않은 알림 개수
```http
GET /api/notifications/{user_id}/unread-count
```

### 3. 알림 읽음 처리
```http
PUT /api/notifications/{notification_id}/read?user_id={user_id}
```

### 4. 알림 삭제
```http
DELETE /api/notifications/{notification_id}?user_id={user_id}
```

## 실시간 알림 (SSE)

### JavaScript 연동 예시

```javascript
class NotificationService {
  constructor(userId, baseUrl = null) {
    this.userId = userId;
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // 환경에 따른 기본 URL 설정
    this.baseUrl = baseUrl || this.getBaseUrl();
  }

  // 환경별 기본 URL 반환
  getBaseUrl() {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8080';
    } else {
      // 운영 환경 - 실제 notification-service URL로 수정 필요
      return 'https://api.buildingbite.com/notifications';
    }
  }

  // SSE 연결 시작
  connect() {
    const url = `${this.baseUrl}/api/notifications/stream/${this.userId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('✅ 실시간 알림 연결 성공');
      this.reconnectAttempts = 0;
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
      console.error('❌ SSE 연결 오류:', error);
      this.handleReconnect();
    };
  }

  // 알림 처리
  handleNotification(data) {
    switch (data.type) {
      case 'connected':
        console.log('연결됨:', data.user_id);
        break;
        
      case 'notification':
        this.showNotification(data.data);
        this.updateNotificationCount();
        break;
        
      case 'keepalive':
        // 연결 유지 신호 (무시)
        break;
        
      case 'error':
        console.error('서버 오류:', data.message);
        break;
    }
  }

  // 알림 표시
  showNotification(notification) {
    // 브라우저 알림 표시
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png',
        tag: notification.event_id
      });
    }

    // UI에 알림 추가
    this.addNotificationToUI(notification);
    
    // 결과 데이터 자동 조회 (선택사항)
    if (notification.data_url && notification.message_type === 'success') {
      this.fetchNotificationData(notification);
    }
  }

  // 알림 관련 데이터 조회
  async fetchNotificationData(notification) {
    try {
      const response = await fetch(notification.data_url, {
        headers: {
          'X-User-Id': this.userId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('알림 데이터 조회 성공:', data);
        
        // 데이터를 UI에 반영 (예: 결과 페이지로 이동하거나 팝업 표시)
        this.handleNotificationData(notification, data);
      }
    } catch (error) {
      console.error('알림 데이터 조회 실패:', error);
    }
  }

  // 알림 데이터 처리
  handleNotificationData(notification, data) {
    // 데이터 타입에 따른 처리
    if (notification.service_type === 'product-details') {
      // 상품 상세 페이지 데이터 처리
      console.log('상품 상세 정보:', data);
      
      // 예: 모달 표시, 페이지 이동, 캐시 업데이트 등
      if (notification.action_url) {
        // 자동으로 결과 페이지로 이동할지 사용자에게 확인
        const shouldNavigate = confirm(`${notification.title}\n결과를 확인하시겠습니까?`);
        if (shouldNavigate) {
          window.location.href = notification.action_url;
        }
      }
    }
  }

  // UI에 알림 추가
  addNotificationToUI(notification) {
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification-item';
    notificationElement.innerHTML = `
      <div class="notification-header">
        <h4>${notification.title}</h4>
        <span class="timestamp">${new Date(notification.created_at).toLocaleString()}</span>
      </div>
      <div class="notification-body">
        <p>${notification.message}</p>
        <div class="notification-actions">
          ${notification.action_url ? `<button class="btn-primary" onclick="location.href='${notification.action_url}'">${notification.action_label || '자세히 보기'}</button>` : ''}
          ${notification.data_url ? `<button class="btn-secondary" onclick="window.notificationService.fetchNotificationData({event_id: '${notification.event_id}', data_url: '${notification.data_url}', service_type: '${notification.service_type}'})">데이터 조회</button>` : ''}
        </div>
      </div>
    `;

    // 알림 목록에 추가
    const notificationList = document.getElementById('notification-list');
    notificationList.insertBefore(notificationElement, notificationList.firstChild);
  }

  // 재연결 처리
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`재연결 시도 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
        this.reconnectAttempts++;
        this.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // 지수 백오프
    }
  }

  // 연결 해제
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // 읽지 않은 알림 개수 업데이트
  async updateNotificationCount() {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/${this.userId}/unread-count`);
      const data = await response.json();
      
      if (data.success) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
          badge.textContent = data.data.unread_count;
          badge.style.display = data.data.unread_count > 0 ? 'inline' : 'none';
        }
      }
    } catch (error) {
      console.error('알림 개수 업데이트 실패:', error);
    }
  }

  // 알림 읽음 처리
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/${notificationId}/read?user_id=${this.userId}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        this.updateNotificationCount();
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/${notificationId}?user_id=${this.userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        this.updateNotificationCount();
        // UI에서 알림 제거
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
          element.remove();
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  }
}

// 사용 예시
const userId = 'user123'; // 실제 사용자 ID
const notificationService = new NotificationService(userId);

// 전역에서 접근 가능하도록 설정 (UI에서 사용)
window.notificationService = notificationService;

// 페이지 로드 시 연결
window.addEventListener('load', () => {
  // 브라우저 알림 권한 요청
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // 실시간 알림 연결
  notificationService.connect();
  
  // 초기 알림 목록 로드
  notificationService.updateNotificationCount();
});

// 페이지 종료 시 연결 해제
window.addEventListener('beforeunload', () => {
  notificationService.disconnect();
});
```

### React 컴포넌트 예시

```jsx
import React, { useState, useEffect, useCallback } from 'react';

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://api.buildingbite.com/notifications';
      const response = await fetch(`${baseUrl}/api/notifications/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  }, [userId]);

  useEffect(() => {
    // 초기 데이터 로드
    fetchNotifications();

    // SSE 연결
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080' 
      : 'https://api.buildingbite.com/notifications';
    const eventSource = new EventSource(`${baseUrl}/api/notifications/stream/${userId}`);
    
    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        setNotifications(prev => [data.data, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
          new Notification(data.data.title, {
            body: data.data.message,
            icon: '/notification-icon.png'
          });
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://api.buildingbite.com/notifications';
      const response = await fetch(`${baseUrl}/api/notifications/${notificationId}/read?user_id=${userId}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.event_id === notificationId ? {...n, status: 'read'} : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h3>알림 ({unreadCount})</h3>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 연결됨' : '🔴 연결 안됨'}
        </span>
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <div 
            key={notification.event_id} 
            className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
            onClick={() => markAsRead(notification.event_id)}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span className="timestamp">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationComponent;
```

## CSS 스타일 예시

```css
.notification-container {
  max-width: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.notification-header {
  background: #f5f5f5;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-item h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.notification-item p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
}

.timestamp {
  font-size: 11px;
  color: #999;
}

.status.connected {
  color: #4caf50;
}

.status.disconnected {
  color: #f44336;
}

#notification-badge {
  background: #ff4444;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.notification-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #eeeeee;
}
```

## 주의사항

1. **브라우저 호환성**: SSE는 모든 모던 브라우저에서 지원됩니다 (IE 제외)

2. **연결 관리**: 
   - 네트워크 오류 시 자동 재연결 구현 필요
   - 페이지 이동 시 연결 해제 필요

3. **성능**: 
   - 알림 목록은 페이지네이션 사용 권장
   - 불필요한 API 호출 최소화

4. **보안**:
   - 사용자 인증 확인 필요
   - CORS 설정 확인

5. **모바일**: 
   - 백그라운드에서 연결 유지 어려움
   - Push Notification 대안 고려

## CORS 및 도메인 설정

프론트엔드가 정적 파일 서빙이고 백엔드가 별도 도메인인 경우:

1. **Notification Service CORS 설정**
   - `notification_api.py`에서 `allow_origins`를 프론트엔드 도메인으로 제한
   - 예: `allow_origins=["https://your-frontend-domain.com"]`

2. **Ingress/Load Balancer 설정**
   - notification-service를 외부에서 접근 가능하도록 노출
   - 예: `https://api.buildingbite.com/notifications`

3. **환경별 URL 설정**
   ```javascript
   // 환경 변수나 설정 파일 사용 권장
   const config = {
     development: 'http://localhost:8080',
     production: 'https://api.buildingbite.com/notifications'
   };
   
   const baseUrl = config[process.env.NODE_ENV] || config.production;
   ```

4. **프록시 설정 (대안)**
   - 프론트엔드 서버에서 API 프록시 설정
   - `/api/notifications/*` → `https://api.buildingbite.com/notifications/api/notifications/*`