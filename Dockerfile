# syntax=docker/dockerfile:1

# ---------- 1) Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# 의존성 설치 (스크립트는 스킵 — prisma generate는 스키마 복사 후 명시적으로 실행)
# .npmrc: puppeteer Chromium 다운로드 스킵(ERD는 Mermaid .md 출력이라 불필요)
COPY package*.json .npmrc ./
RUN npm ci --ignore-scripts

# 소스 복사 후 Prisma 클라이언트 생성 + 빌드
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- 2) Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 마이그레이션(prisma migrate deploy)에 필요한 스키마/설정을 먼저 복사한다.
# docs/: postinstall의 prisma generate가 ERD를 쓰므로 디렉토리가 있어야 한다.
COPY package*.json .npmrc ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docs ./docs

# 프로덕션 의존성 설치. 스크립트를 실행해 빌드 시점(root)에
# Prisma schema-engine 다운로드 + 클라이언트 생성을 끝내둔다(런타임엔 읽기 전용).
RUN npm ci --omit=dev && npm cache clean --force

# 빌드 산출물(컴파일된 앱 + Prisma 클라이언트) 복사
COPY --from=builder /app/dist ./dist

# 비루트 사용자로 실행
USER node

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
