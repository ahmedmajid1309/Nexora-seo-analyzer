FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY src ./src
COPY services/audit-worker ./services/audit-worker
COPY scripts ./scripts

RUN corepack enable && pnpm install --prod --frozen-lockfile --ignore-scripts

ENV NODE_ENV=production
CMD ["pnpm", "worker:audit"]
