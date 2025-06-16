FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 1000

ENV NODE_ENV=production
ENV PORT=1000

# Run with ts-node (uses local devDependency)
CMD ["npx", "ts-node", "./src/index.ts"]
