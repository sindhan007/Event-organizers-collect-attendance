FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY models ./models
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD ["npm", "start"]
