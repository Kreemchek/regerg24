# 🚀 Развертывание Telegram Web App

## 📋 Быстрый старт

### 1. Развертывание Web App

#### Вариант A: GitHub Pages (рекомендуется)
```bash
# 1. Создайте репозиторий на GitHub
# 2. Загрузите файлы проекта
# 3. Включите GitHub Pages в Settings > Pages
# 4. URL: https://ваш-username.github.io/WebUnit-economik
```

#### Вариант B: Netlify
```bash
# 1. Зайдите на netlify.com
# 2. Перетащите папку с проектом
# 3. Получите URL: https://случайное-имя.netlify.app
```

#### Вариант C: Vercel
```bash
# 1. Зайдите на vercel.com
# 2. Импортируйте проект из GitHub
# 3. Получите URL: https://ваш-проект.vercel.app
```

### 2. Создание Telegram бота

1. **Найдите [@BotFather](https://t.me/BotFather) в Telegram**
2. **Создайте бота:**
   ```
   /newbot
   Имя: Калькулятор Юнит-Экономики
   Username: MaksimovWB_CalculatorBot
   ```
3. **Сохраните TOKEN бота**

### 3. Настройка Web App

1. **Создайте Web App:**
   ```
   /newapp
   Выберите бота
   Название: Калькулятор Юнит-Экономики
   Описание: Расчет прибыльности товаров на Wildberries
   Иконка: загрузите 512x512px
   URL: https://ваш-домен.com/index.html
   ```

2. **Настройте меню:**
   ```
   /setmenubutton
   Выберите бота
   Текст: Калькулятор Юнит-Экономики
   URL: https://ваш-домен.com/index.html
   ```

### 4. Запуск Python бота (опционально)

```bash
# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
cp env.example .env
# Отредактируйте .env с вашими данными

# Запустите бота
python bot.py
```

## 🔧 Конфигурация

### Переменные окружения (.env)
```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEB_APP_URL=https://ваш-домен.com/index.html
```

### Настройка команд бота
```
/setcommands
```

```
start - Запустить калькулятор
help - Помощь по использованию
about - О боте и авторе
```

## 📱 Тестирование

### 1. Локальное тестирование
```bash
# Откройте index.html в браузере
open index.html
```

### 2. Тестирование в Telegram
1. Найдите вашего бота
2. Нажмите `/start`
3. Нажмите кнопку "Открыть калькулятор"
4. Протестируйте все функции

## 🎯 Готовые файлы

✅ `index.html` - основное приложение  
✅ `styles.css` - стили с поддержкой Telegram  
✅ `script.js` - логика с Telegram Web Apps API  
✅ `bot.py` - Python бот  
✅ `requirements.txt` - зависимости Python  
✅ `telegram-bot-setup.md` - подробная инструкция  

## 🚀 Результат

После выполнения всех шагов у вас будет:

- 🤖 **Telegram бот** с Web App
- 📊 **Полнофункциональный калькулятор** юнит-экономики
- 🎨 **Современный интерфейс** с поддержкой тем Telegram
- 📱 **Адаптивный дизайн** для всех устройств
- 🔗 **Интеграция с Telegram** для обмена результатами

## 📞 Поддержка

**Автор:** [@MaksimovWB](https://t.me/MaksimovWB)  
**Создано для:** оптимизации бизнеса на маркетплейсах

---

*Удачного использования! 🚀*
