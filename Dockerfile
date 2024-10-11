FROM node:20-slim as server-builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Install server dependencies
COPY package.json .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install

# Copy code and build server
COPY . .
RUN pnpm run build

FROM node:20-slim as server-runner

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

COPY --from=server-builder /usr/src/app/package.json ./
COPY --from=server-builder /usr/src/app/dist ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install --prod

ENV NODE_ENV=production
EXPOSE 8000

ENTRYPOINT ["node", "/usr/src/app/main.js"]
