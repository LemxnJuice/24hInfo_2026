FROM node:20-alpine
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# copy sources
COPY . .

# generate prisma client
RUN npx prisma generate || true
# build
RUN npm run build || true

# copy startup script and make executable
COPY start.sh ./
RUN chmod +x ./start.sh

EXPOSE 4000
CMD ["sh", "./start.sh"]
