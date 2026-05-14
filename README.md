# 📘 in-exp-app

Полноценное fullstack-приложение для учёта финансов (доходы/расходы). Архитектура разделена на независимые модули: **Backend** (REST API на Node.js) и **Frontend** (клиентская часть, собираемая через Webpack 5).

---

## 🛠 Технологический стек

| Слой | Технологии |
|------|------------|
| **Frontend** | Vanilla JS, HTML5, CSS3, Bootstrap 5, Bootstrap Icons, Chart.js, Webpack 5 |
| **Backend** | Node.js, Express, LowDB (JSON-БД), JWT (авторизация), Bcrypt |
| **DevTools** | Webpack Dev Server (HMR), Nodemon, Concurrently, MiniCssExtractPlugin |

---

##  Установка

Для первоначальной настройки выполните в корневой папке проекта:

```bash
npm run install-all
```
> Эта команда последовательно установит зависимости для корневого проекта и для папки `backend/`.

---

## 🚀 Доступные скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск режима разработки: Backend + Webpack Dev Server (горячая перезагрузка) |
| `npm run build` | Продакшн-сборка frontend в папку `dist/` (минификация, хэши, tree-shaking) |
| `npm run preview` | Сборка + запуск статического сервера для проверки готовой версии на `:8080` |
| `npm run backend` | Запуск только серверной части (`nodemon app.js`) |
| `npm run frontend` | Запуск только Webpack Dev Server |
| `npm run install-all` | Переустановка всех зависимостей (root + backend) |

---

## 📂 Структура проекта

```
project/
├── backend/               # Серверная часть
│   ├── app.js             # Точка входа Express
│   ├── routes/            # Маршруты API
│   ├── controllers/       # Бизнес-логика
│   ├── models/            # Работа с LowDB
│   ├── config/            # Конфигурации (JWT, DB, etc.)
│   └── utils/             # Вспомогательные функции
│
├── frontend/              # Исходный код клиентской части
│   ├── scripts/           # JavaScript модули
│   ├── styles/            # CSS стили
│   ├── templates/         # HTML-шаблоны/фрагменты
│   ├── images/            # Статические изображения
│   ├── index.html         # Главная страница
│   ├── login.html         # Страница авторизации
│   └── registration.html  # Страница регистрации
│
├── dist/                  # 📦 Собранный frontend (генерируется автоматически)
├── webpack.config.js      # Конфигурация сборщика
├── package.json           # Корневые скрипты и зависимости frontend
└── README.md
```

---

## ⚙️ Особенности разработки

### 🔹 Режим разработки (`npm run dev`)
- **Frontend** запускается на `http://localhost:8080`
- **Backend** работает на порте, указанном в `backend/app.js` (по умолчанию `3000`)
- Все запросы к `/api/*` автоматически проксируются через Webpack Dev Server на backend. CORS не требуется в режиме разработки.
- Изменения в `scripts/`, `styles/` и `*.html` применяются мгновенно (HMR).

###  Продакшн-сборка (`npm run build`)
- JavaScript минифицируется и разбивается на чанки
- CSS извлекается в отдельные файлы с хэшами для долгосрочного кэширования
- Изображения и шаблоны копируются в `dist/`
- Готовые файлы оптимизированы для раздачи через CDN или статический хостинг

---
<!--
## 🌐 Деплой

### Frontend
1. Выполните `npm run build`
2. Загрузите содержимое папки `dist/` на любой статический хостинг:
   - Vercel / Netlify / GitHub Pages / Cloudflare Pages
3. Настройте fallback на `index.html` для SPA-роутинга (если используется).

### Backend
1. Загрузите папку `backend/` на Node.js-хостинг (Render, Railway, VPS, Heroku)
2. Установите зависимости: `npm install --production`
3. Запустите: `npm start`
4. **Обязательно** настройте переменные окружения:
   - `PORT` (порт сервера)
   - `JWT_SECRET` (секретный ключ для токенов)
   - `NODE_ENV=production`

---

## ⚠️ Важные замечания

1. **Прокси API в dev-режиме**  
   В `webpack.config.js` настроен прокси `/api` → `http://localhost:3000`. Убедитесь, что порт backend совпадает с настройками в конфиге.

2. **Лишние зависимости в backend**  
   В `backend/package.json` присутствуют пакеты `"install"` и `"npm"`. Они не требуются для работы приложения и могут конфликтовать с менеджером пакетов. Рекомендуется удалить их:
   ```bash
   cd backend
   npm uninstall install npm
   ```

3. **База данных**  
   Проект использует `lowdb` (файловое JSON-хранилище). Для продакшена рекомендуется заменить на PostgreSQL/MongoDB или настроить автоматический бэкап файла `db.json`.

4. **Безопасность**  
   - Не коммитьте `backend/data/*.json` в публичные репозитории
   - Используйте `dotenv` для хранения секретов (JWT_SECRET, порты, ключи)

---

## 📝 Лицензия

ISC © 2026 in-exp-app team

--->
