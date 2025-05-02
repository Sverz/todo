# Базовий імедж
FROM node:20

# Робоча директорія
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Оновлюємо TypeScript до останньої версії
RUN npm install typescript@latest --save-dev

# Копіюємо весь код проєкту
COPY . .

# Компілюємо TypeScript
RUN npm run build -- --ignore-ts-errors

# Експонуємо порт, якщо ти його використовуєш
EXPOSE 3333

# Запускаємо сервер
CMD ["node", "build/server.js"]
