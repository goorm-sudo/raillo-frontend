#!/bin/bash

# Raillo 프로젝트 통합 개발환경 열기 스크립트
# 사용법: ./open-raillo.sh

echo "🚀 Raillo 프로젝트 통합 개발환경을 시작합니다..."

# 프로젝트 루트 디렉토리로 이동
cd /Users/park/SynologyDrive/ideProjects

# Cursor로 백엔드와 프론트엔드 동시에 열기
echo "📂 Cursor로 프로젝트를 열고 있습니다..."
code raillo-frontend raillo-backend

echo "✅ 통합 개발환경이 준비되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. 백엔드 실행: cd raillo-backend && MYSQL_USER=raillo_user MYSQL_PASSWORD=ansim1234! DB_HOST=192.168.1.245 DB_NAME=raillo_db SPRING_PROFILES_ACTIVE=local ./gradlew bootRun"
echo "2. 프론트엔드 실행: cd raillo-frontend && npm run dev"
echo "3. 브라우저에서 http://localhost:3000 접속" 