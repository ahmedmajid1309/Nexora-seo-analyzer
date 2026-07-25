FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install --omit=dev && npm install --save-dev typescript @types/node && npm run build

ENV NODE_ENV=production
ENV PORT=3001
CMD ["node", "dist/server.js"]
