# kafka-react-vite-app
kafka 연결을 위한 vite react app 보일러 플레이트 저장소 입니다.

# 사전 준비
- docker: v28.x ('25.7.7 기준 lts)
- node: v22.x ('25.7.8 기준 lts)

# 사용법

## 실행

```
bash ./scripts/docker-run.sh <DOCKER HUB ID>
```
- 위 명령어 사용시 `app 빌드 -> docker 빌드 -> docker push -> docker run` 순서로 진행됩니다.

## 테스트

- `npm run dev` 혹은 `yarn dev` 를 통해 개발용으로 열 수 있습니다.

# 배포 (쿠버네티스)

## 사전 설정

### azure 설치

```
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### azure 로그인

```
az login --use-device-code
```

### 쿠버네티스 클러스터 연결

```
az aks get-credentials --resource-group <마이크로소프트 리소스 그룹> --name <마이크로소프트 쿠버네티스 클러스터>
```

### 쿠버네티스 CLI 도구 설치
- 링크 참조: https://kubernetes.io/ko/docs/tasks/tools/install-kubectl-linux/

## 쿠버네티스 설정 실행

```
bash ./scripts/kube-run.sh <DOCKER HUB ID>
```

- 각 설정에 따라 `Dockerfile.prod`, `.env.kubernetes` 파일을 수정해주세요.
- image 는 docker hub에 올린 이미지 사용 (기본: `chldlsrb1000/frontend:latest`)

### 추가 명령어

```
# 제거하기
kubectl delete -f kubernetes/gateway.yml

# 확인하기 (pods, services, deployments..)
kubectl get all

# 로그확인(-f: 실시간 옵션)
kubectl logs <POD NAME>

# 바로 재반영
kubectl get deployment  # 확인
kubectl rollout restart deployment/gateway  # 재반영
```
