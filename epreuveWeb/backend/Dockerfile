FROM node:20-alpine
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# copy sources
COPY . .

# build
RUN npm run build || true

EXPOSE 4000
CMD ["node", "dist/index.js"]
