# syntax=docker/dockerfile:1

# ---------- 1) Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# 의존성 설치 (스크립트는 스킵 — prisma generate는 스키마 복사 후 명시적으로 실행)
COPY package*.json ./
RUN npm ci --ignore-scripts

# 소스 복사 후 Prisma 클라이언트 생성 + 빌드
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- 2) Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 프로덕션 의존성만 설치 (postinstall 스킵 — 클라이언트는 dist에 이미 컴파일됨)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 빌드 산출물(컴파일된 앱 + Prisma 클라이언트)만 복사
COPY --from=builder /app/dist ./dist

# 비루트 사용자로 실행
USER node

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
