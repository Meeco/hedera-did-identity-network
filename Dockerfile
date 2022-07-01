FROM node:16.15.1-alpine AS builder
ENV NODE_ENV build
WORKDIR /app
COPY . /app
RUN npm install \
    && npm ci \
    && npm run build \
    && npm prune --production

FROM node:16.15.1-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=builder /app/build/ /app/build/
COPY --from=builder /app/public/ /app/public/
EXPOSE 8000
CMD ["npm", "start"]