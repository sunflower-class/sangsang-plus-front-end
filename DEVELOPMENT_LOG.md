# 개발 진행 상황 및 문제점 정리

## 📋 완료된 작업들

### 1. 실시간 알림 시스템 구현
- **Server-Sent Events (SSE)** 기반 실시간 알림
- **NotificationService**: SSE 연결, 자동 재연결, 폴링
- **NotificationBell**: 헤더에 알림 벨, 읽지 않은 개수 표시
- **NotificationList**: 알림 목록 표시, 클릭 처리
- **NotificationProvider**: 전역 알림 상태 관리

### 2. 토큰 자동 갱신 시스템
- **JWT 토큰 만료 감지**: `isTokenExpired`, `isTokenExpiringSoon` 유틸
- **자동 리프레시**: axios 인터셉터를 통한 401 에러 처리
- **AuthContext 동기화**: 토큰 갱신 시 사용자 정보 업데이트
- **프로액티브 갱신**: 만료 5분 전 자동 갱신

### 3. 202 Accepted 응답 처리
- **비동기 처리 모드**: 즉시 반환, 알림으로 완료 통지
- **대기 모드**: 완료될 때까지 대기, 진행상황 표시
- **자동 모드**: 예상 시간에 따라 대기/비동기 결정
- **ProcessingModeSelector**: 사용자가 모드 선택 가능

### 4. 에디터 페이지 연동
- **라우터 설정**: `/editor/new-page`, `/editor/:pageId` 추가
- **HTML 데이터 전달**: React Router state를 통한 데이터 전달
- **블록별 편집**: 생성된 HTML을 섹션별로 수정 가능

### 5. API 엔드포인트 수정
- **인증 API**: `/api/users/api/auth` → `/api/auth`
- **알림 API**: `/notifications/api/notifications` → `/api/notifications`
- **고객 관리 API**: `/api/customer` → `/api/management`

---

## 🔥 주요 문제점들과 해결 과정

### 1. 토큰 갱신 문제
**문제**: `리프레시 토큰이 없습니다` 에러
**원인**: 
- `VITE_USER_URL`에 이미 `/api/users` 포함
- `authService.ts`에서 `${VITE_USER_URL}/api/auth` 사용으로 중복
**해결**: `VITE_API_URL`을 사용하도록 변경

### 2. 404 에러 (에디터 페이지)
**문제**: `/editor/new-page` 접근 시 404
**원인**: 라우터에 경로 설정 누락
**해결**: `App.tsx`에 라우트 추가

### 3. React Router 훅 에러
**문제**: `useNavigate` 훅 사용 시 런타임 에러
**원인**: `NotificationProvider`가 `BrowserRouter` 외부에 위치
**해결**: `NotificationProvider`를 `BrowserRouter` 내부로 이동

### 4. TypeScript 빌드 에러들
**문제들**:
- `html_list` 프로퍼티 타입 누락
- 구조 분해 할당 구문 오류
**해결**:
- `ProductDetailsData` 인터페이스에 `html_list?: string[]` 추가
- 함수 매개변수 구문 수정

### 5. SSE 연결 불안정 (502 에러)
**문제**: 상세페이지 생성 중 짧은 시간 502 에러 반복
**원인**: 백엔드 처리 중 SSE 서버 불안정
**해결**: 
- 프론트엔드: 재연결 로직 개선, 재시도 횟수 증가
- 백엔드: 인프라 설정 필요 (권장사항 포함)

### 6. 알림 클릭 시 결과 페이지 미동작
**문제**: 알림 클릭해도 에디터 페이지 안 열림
**원인**: `action_url`이 외부 URL로 설정됨
**해결**: `data_url`에서 HTML 데이터 가져와서 에디터로 이동하도록 수정

---

## 🏗️ 현재 시스템 아키텍처

### 알림 플로우
```
백엔드 작업 완료 → SSE 알림 전송 → NotificationProvider 수신 
→ data_url에서 HTML 데이터 조회 → 에디터 페이지로 이동
```

### 컴포넌트 구조
```
App
├── AuthProvider
├── BrowserRouter
    └── NotificationProvider
        ├── Header (NotificationBell)
        ├── Routes
        │   ├── Generate
        │   ├── Editor
        │   └── ...
        └── Footer
```

### 토큰 관리
```
axios 인터셉터 → 401 감지 → refreshToken() → 새 토큰 저장 
→ AuthContext 업데이트 → 원래 요청 재시도
```

---

## 🚧 알려진 이슈들

### 1. SSE 연결 안정성
- **현상**: 백엔드 처리 중 502 에러 간헐적 발생
- **임시 해결**: 재연결 로직으로 완화
- **근본 해결 필요**: 백엔드 인프라 (notification-service, 로드밸런서)

### 2. 환경 변수 관리
- **현황**: Docker, CI/CD, 로컬 각각 다른 설정
- **주의점**: API 엔드포인트 변경 시 3곳 모두 수정 필요
- **파일들**:
  - `src/env/env.ts`
  - `Dockerfile.prod`
  - `.github/workflows/ci-cd.yml`

### 3. X-User-Id 헤더 처리
- **변경사항**: 수동 헤더 추가 제거
- **현재**: Spring Gateway에서 JWT 파싱하여 자동 추가
- **주의**: 백엔드 게이트웨이 설정에 의존

---

## 🔧 백엔드에서 확인 필요한 사항들

### 1. Notification Service 안정성
```yaml
# 리소스 할당 권장
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi" 
    cpu: "500m"
```

### 2. Ingress/Gateway SSE 설정
```yaml
# 타임아웃 설정 권장
nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
```

### 3. 알림 데이터 형식 확인
```json
{
  "event_id": "task_12345_completed",
  "service_type": "product-details",
  "message_type": "success",
  "data_url": "https://oauth.buildingbite.com/api/generation/product-details/12345",
  "action_url": "https://buildingbite.com/product-details/14"
}
```

---

## 📝 다음에 작업할 때 확인사항

### 1. 알림 시스템 테스트
- [ ] 실시간 알림 수신 확인
- [ ] 알림 클릭 시 에디터 이동 확인
- [ ] HTML 데이터 정상 표시 확인

### 2. 디버깅 도구
- 브라우저 콘솔에서 상세 로그 확인 가능
- 알림 처리 과정 단계별 로그 출력됨

### 3. 빌드 확인사항
- TypeScript 컴파일 에러 주의
- 환경 변수 설정 확인
- Docker 빌드 성공 여부

---

## 🎯 추가 개선 아이디어

### 1. 사용자 경험 개선
- 알림 설정 페이지 (알림 on/off, 타입별 설정)
- 알림 히스토리 페이지
- 에디터에서 저장 기능

### 2. 성능 최적화
- 알림 데이터 캐싱
- SSE 연결 풀링
- 이미지 lazy loading

### 3. 에러 핸들링 강화
- 오프라인 상태 감지
- 네트워크 에러 재시도
- 사용자 친화적 에러 메시지

---

**마지막 업데이트**: $(date +%Y-%m-%d %H:%M:%S)
**작업자**: Claude Code Assistant

> 💡 이 문서는 개발 진행상황을 추적하기 위한 것입니다. 
> 새로운 문제나 해결책을 발견하면 계속 업데이트해주세요.