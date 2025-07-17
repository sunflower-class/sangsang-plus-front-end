#!/bin/bash

# 사용자명 인자 체크
if [ -z "$1" ]; then
  echo "❌ Docker Hub 사용자명을 인자로 입력해주세요."
  echo "예시: bash ./scripts/kube-run.sh chldlsrb1000"
  exit 1
fi

DOCKER_HUB_ID="$1"

echo ""
echo "🚀 [frontend] 빌드 및 컨테이너 실행 중..."

TAG="${DOCKER_HUB_ID}/frontend:latest"

# 도커 이미지 빌드
docker build -t "$TAG" -f Dockerfile.prod . || { echo "❌ Docker 빌드 실패: $TAG"; exit 1; }

# Docker Hub에 푸시
docker push "$TAG" || { echo "❌ Docker 푸시 실패: $TAG"; exit 1; }

# 불필요한 이미지 및 컨테이너 정리
docker image prune -f

kubectl apply -f kubernetes/deploy.yml || { echo "❌ Kubernetes 배포 실패"; exit 1; }

echo ""
echo "✅ kubernetes frontend 서비스가 실행되었습니다."
