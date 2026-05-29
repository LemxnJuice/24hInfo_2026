FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
RUN npm run build || true

# use a simple static server
RUN npm i -g serve
EXPOSE 5173
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
