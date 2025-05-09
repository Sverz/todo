FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --no-optional && npm cache clean --force

COPY . .

RUN chmod +x ace

WORKDIR /app

RUN apk --no-cache add curl && \
    apk --no-cache upgrade

COPY --from=build /app .

RUN find ./node_modules -type d -name "test" -o -name "tests" -o -name "docs" | xargs rm -rf 2>/dev/null || true && \
    find ./node_modules -type f -name "*.md" -o -name "*.txt" -o -name "*.map" | xargs rm -f 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3333
ENV NODE_OPTIONS="--max-old-space-size=70 --max-semi-space-size=2"

EXPOSE 3333

CMD ["node", "-r", "@adonisjs/assembler/build/register", "server.ts"]