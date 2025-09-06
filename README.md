<div align="center">
<h1>[KT AIVLE School] 상상더하기 (Sangsang Plus)</h1>
<h3>AI 기반 이커머스 상세페이지 자동 생성 및 최적화 솔루션</h3>
<br/>
<img width="758" alt="01 썸네일" src="https://github.com/user-attachments/assets/adbf3c61-0106-46ff-8141-520fa02a8ea1" />

<!-- <img src="YOUR_PROJECT_IMAGE_URL" alt="Project Banner" width="800"/> -->
<p>
  <strong>상상더하기</strong>는 최신 AI 기술을 접목한 마이크로서비스 아키텍처 기반의 E-Commerce 플랫폼입니다. <br />
  단순 상품 판매를 넘어, AI를 통해 콘텐츠 생성, 고객 지원, 데이터 분석 및 의사결정까지 자동화하여<br />
  혁신적인 사용자 경험과 운영 효율성을 제공하는 것을 목표로 합니다.
</p>
</div>

## 🏗️ 프로젝트 아키텍처

상상더하기는 기능별로 분리된 독립적인 마이크로서비스(MSA)들로 구성되어 있으며, API Gateway를 통해 통신합니다. 각 서비스는 컨테이너화되어 Kubernetes 환경에서 유연하게 확장 및 관리됩니다.

## ⚙️ 서비스 소개

| 서비스명 | 주요 기술 | 역할 및 주요 기능 |
| :--- | :--- | :--- |
| **sangsang-plus-gateway** | `Spring Cloud Gateway` | **API 게이트웨이**. 모든 요청의 진입점으로, 인증(JWT, OAuth2), 인가 및 라우팅을 중앙에서 처리합니다. |
| **sangsang-plus-user** | `Spring Boot`, `Java` | **사용자 서비스**. 회원가입, 로그인, 프로필 관리 등 사용자 관련 모든 기능을 담당합니다. |
| **sangsang-plus-product** | `Spring Boot`, `Java` | **상품 서비스**. 상품의 핵심 정보(CRUD, 검색, 카테고리)를 관리하는 마스터 서비스입니다. |
| **product-details-service** | `FastAPI`, `Python` | **AI 상품 상세 생성**. 상품 정보만으로 풍부한 HTML 상세 페이지와 이미지를 AI가 자동으로 생성합니다. |
| **review-service** | `FastAPI`, `Python` | **AI 리뷰 분석**. 업로드된 리뷰 파일(Excel/CSV)을 AI가 분석하여 긍/부정, 핵심 요약, 개선점을 도출합니다. |
| **customer-service** | `FastAPI`, `Python` | **AI 고객센터 (RAG)**. RAG 기반 챗봇이 고객 문의에 실시간으로 답변하며, 답변하지 못할 시 관리자에게 연동됩니다. |
| **ABtest-service** | `FastAPI`, `Python` | **A/B 테스트 자동화**. 상품 페이지의 어떤 버전이 더 나은 성과를 내는지 자동으로 실험하고, 승자를 판별하여 적용합니다. |
| **sangsang-plus-front-end** | `React`, `TypeScript` | **프론트엔드**. 사용자가 상상더하기 서비스를 이용하는 웹 애플리케이션입니다. |


## ✨ 주요 기능

### 🤖 AI 기반 콘텐츠 자동화
- **상세 페이지 자동 생성**: 상품명, 가격 등 기본 정보만 입력하면 AI가 매력적인 상세 설명과 이미지를 생성하여 완성된 HTML 페이지를 제공합니다. (`product-details-service`)
- **지능형 리뷰 분석**: 고객 리뷰를 파일로 업로드하면 AI가 긍/부정 감성, 핵심 키워드, 제품의 장단점을 분석하고 개선 아이디어를 제안합니다. (`review-service`)

### ⚡️ 지능형 고객 지원 및 데이터 기반 의사결정
- **RAG 기반 AI 챗봇**: 고객 문의에 24시간 실시간으로 답변하며, 답변하지 못하는 질문은 관리자에게 전달되고, 관리자의 답변은 다시 AI의 지식으로 자동 학습됩니다. (`customer-service`)
- **A/B 테스트 자동화**: 어떤 디자인, 문구, 가격이 가장 높은 구매 전환율을 보이는지 자동으로 테스트하고, 최적의 안을 스스로 적용하여 매출을 극대화합니다. (`ABtest-service`)

### 🛡️ 안정적이고 확장 가능한 시스템
- **MSA 아키텍처**: 각 기능이 독립된 서비스로 분리되어 있어, 특정 서비스의 장애가 전체 시스템에 영향을 주지 않으며, 서비스별 확장이 용이합니다.
- **중앙 집중식 인증/인가**: API Gateway에서 모든 서비스의 인증/인가를 처리하여 보안을 강화하고, 각 서비스는 비즈니스 로직에만 집중할 수 있습니다. (`sangsang-plus-gateway`)
- **비동기 이벤트 기반 통신**: Kafka/Event Hubs를 통해 서비스 간 결합도를 낮추고, 대용량 트래픽에도 안정적인 처리가 가능합니다.

## 🛠️ 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| **Frontend** | `React`, `TypeScript`, `Vite`, `React Query`, `Tailwind CSS`, `shadcn/ui` |
| **Backend (Java)** | `Spring Boot`, `Spring Cloud Gateway`, `Spring Data JPA`, `Spring Security`, `Java 17` |
| **Backend (Python)** | `FastAPI`, `SQLAlchemy`, `Pydantic` |
| **AI** | `OpenAI GPT-4`, `Together AI`, `LangChain`, `RAG`, `Sentence-Transformers` |
| **Database** | `PostgreSQL (Azure)`, `Redis`, `ChromaDB` |
| **Messaging** | `Kafka`, `Azure Event Hubs` |
| **Infrastructure** | `Docker`, `Kubernetes (Azure AKS)`, `AWS S3` |
| **CI/CD** | `GitHub Actions` |

## 👨‍💻 팀원 구성

| **이민욱 (팀장)** | **최인규** | **김서영** | **허유찬** | **조연서** | **오유진** |
| :---: | :---: | :---: | :---: | :---: | :---: |
| <img width="150" height="150" alt="이민욱" src="https://github.com/user-attachments/assets/4d0dbafd-7212-4274-abc9-ade0be4e722b" /> | <img width="150" height="150" alt="최인규" src="https://github.com/user-attachments/assets/7ab64322-7bd1-4807-bb81-b65fc0f46499" /> | <img width="150" height="150" alt="김서영" src="https://github.com/user-attachments/assets/a70bd33b-195b-4d3c-a0f6-f740d577c778" /> | <img width="150" height="150" alt="허유찬" src="https://github.com/user-attachments/assets/d0842852-f780-4422-b480-8e162c933bb3" /> | <img width="150" height="150" alt="조연서" src="https://github.com/user-attachments/assets/8da660bd-d98b-496a-8b16-3f568d347a41" /> | <img width="150" height="150" alt="오유진" src="https://github.com/user-attachments/assets/5b569bd7-7b04-442c-9e43-423ba575c493" /> |
| 프론트엔드<br/>리뷰 서비스 | 프론트엔드<br/>상세페이지 서비스 | 상세페이지 서비스<br/>리뷰 서비스 | Q&A 서비스<br/>A/B 테스트 서비스 | Q&A 서비스<br/>A/B 테스트 서비스 | DevOps<br/>사용자 서비스<br/>보안 |

## 🚀 시작하기

각 마이크로서비스는 자체 `README.md` 파일에 상세한 설정 및 실행 방법을 포함하고 있습니다.

1.  **전제 조건 확인**: 각 서비스의 `README.md` 파일에서 `Java`, `Python`, `Node.js`, `Docker` 등 필요한 환경의 버전을 확인하고 설치합니다.
2.  **환경 변수 설정**: 각 서비스는 `.env` 또는 Kubernetes `Secret`/`ConfigMap`을 통해 외부 서비스(DB, API Key 등)의 연결 정보를 설정해야 합니다.
3.  **서비스 실행**:
    - **로컬 개발**: 각 서비스 폴더로 이동하여 `mvn spring-boot:run` (Java) 또는 `uvicorn src.main:app` (Python) 등으로 개별 실행할 수 있습니다.
    - **Docker**: `docker-compose` 또는 개별 `docker run` 명령어로 컨테이너 환경을 실행합니다.
    - **Kubernetes**: `kubectl apply -f k8s/` 명령어를 통해 클러스터에 전체 서비스를 배포할 수 있습니다.

자세한 내용은 각 서비스의 `README.md`를 참고해주세요.

## 🎥 소개 영상
 


https://github.com/user-attachments/assets/1341fd25-0cfd-41ab-926a-9ff4478bcee6

