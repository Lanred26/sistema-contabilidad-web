FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY . .
RUN npm run build --prefix frontend

EXPOSE 3000
CMD ["npm", "run", "dev"]
