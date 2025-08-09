# 🔐 دليل إعداد متغيرات البيئة

هذه الملفات **لا يتم تحميلها** في ZIP لأسباب أمنية، لكن ستحتاجها للنشر.

## 📝 ملف .env للإنتاج

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Server Configuration
NODE_ENV=production
PORT=5000
BASE_URL=https://your-domain.com

# Security (مهم جداً - غير هذا!)
SESSION_SECRET="YourVeryLongRandomSecretHereAtLeast64CharactersLongMakeItComplexAndUnique2025"

# Chrome Configuration
CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Bot Configuration
BOT_SLEEP_START=00:00
BOT_SLEEP_END=07:00
MAX_DAILY_VIDEOS=3

# Optional: Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecureAdminPassword123
```

---

## 🚂 متغيرات Railway

عند النشر على Railway، أضف هذه في قسم "Variables":

```
DATABASE_URL=postgresql://... (سيتم إنشاؤه تلقائياً عند إضافة PostgreSQL)
NODE_ENV=production
PORT=5000
SESSION_SECRET=YourVeryLongRandomSecretHereAtLeast64CharactersLong
BOT_SLEEP_START=00:00
BOT_SLEEP_END=07:00
MAX_DAILY_VIDEOS=3
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

---

## 🌊 متغيرات DigitalOcean/VPS

للخوادم المستقلة، أنشئ ملف `.env` في مجلد المشروع:

```bash
# إنشاء ملف .env
nano /opt/whatsapp-bot/.env

# أضف المحتوى أعلاه
# احفظ بـ Ctrl+X ثم Y
```

---

## 🔑 كيفية توليد SESSION_SECRET آمن

```bash
# طريقة 1: استخدام Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# طريقة 2: استخدام OpenSSL
openssl rand -hex 64

# طريقة 3: موقع آمن
# اذهب إلى: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
# اختر: 256-bit (64 characters)
```

---

## 📋 قائمة تحقق المتغيرات

### للـ Railway:
- [ ] `DATABASE_URL` - سيتم إنشاؤه تلقائياً
- [ ] `SESSION_SECRET` - **مُولد عشوائياً** (64+ حرف)
- [ ] `NODE_ENV=production`
- [ ] `CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome`

### للـ VPS (DigitalOcean/Vultr):
- [ ] `DATABASE_URL` - حسب إعداد قاعدة البيانات
- [ ] `SESSION_SECRET` - **مُولد عشوائياً** (64+ حرف)
- [ ] `BASE_URL` - عنوان الخادم/النطاق
- [ ] `CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser`

---

## ⚠️ تنبيهات أمنية مهمة

### 🚫 لا تفعل أبداً:
- لا تشارك ملف `.env` مع أي شخص
- لا ترفعه على GitHub العام
- لا تستخدم كلمات مرور بسيطة في `SESSION_SECRET`

### ✅ افعل دائماً:
- غير `SESSION_SECRET` لقيمة عشوائية
- استخدم كلمات مرور قوية لقاعدة البيانات
- احتفظ بنسخة آمنة من إعدادات الإنتاج

---

## 🔄 نقل الإعدادات من Replit

إذا كنت تنقل من Replit الحالي:

1. **اذهب لتبويب "Secrets"** في Replit
2. **انسخ القيم** الموجودة
3. **أضفها للمنصة الجديدة** (Railway/VPS)

**المتغيرات المهمة في Replit:**
- `DATABASE_URL`
- `SESSION_SECRET` (إذا كان موجود)
- أي إعدادات بوت مخصصة

---

## 🆘 إذا نسيت SESSION_SECRET

```bash
# أوقف البوت
pm2 stop whatsapp-bot

# ولد مفتاح جديد
export NEW_SECRET=$(openssl rand -hex 64)
echo "SESSION_SECRET=$NEW_SECRET" >> .env

# أعد تشغيل البوت
pm2 restart whatsapp-bot
```

**ملاحظة:** المستخدمون سيحتاجون تسجيل دخول مرة أخرى.

---

هذا الدليل مُصمم ليكون مرجعك الكامل لإعداد البيئة الآمنة!