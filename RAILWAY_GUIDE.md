# 🚂 دليل نشر البوت على Railway (مجاني)

Railway منصة رائعة للبداية - مجانية، سهلة، ولا تحتاج بطاقة ائتمان!

## ✨ المميزات:
- 🆓 **مجاني تماماً** - 5$ كريدت شهرياً
- 🚀 **نشر مباشر** من GitHub
- 🎯 **سهل جداً** - بضع نقرات فقط
- 🔄 **تحديثات تلقائية** عند رفع كود جديد
- 📊 **مراقبة مدمجة** للأداء واللوجز

---

## الخطوات:

### 1️⃣ إنشاء حساب GitHub (إذا لم يكن لديك)

1. اذهب إلى [github.com](https://github.com)
2. اضغط **"Sign up"**
3. أدخل بريدك الإلكتروني وكلمة مرور
4. أكد البريد الإلكتروني

### 2️⃣ رفع المشروع على GitHub

**الطريقة السهلة (من الواجهة):**
1. اذهب إلى [github.com/new](https://github.com/new)
2. اسم المستودع: `whatsapp-bot-redz`
3. اختر **Public** (مجاني)
4. اضغط **"Create repository"**

**رفع الملفات:**
1. اضغط **"uploading an existing file"**
2. اسحب وأفلت جميع ملفات المشروع
3. اكتب رسالة: `Initial bot upload`
4. اضغط **"Commit changes"**

### 3️⃣ إنشاء حساب Railway

1. اذهب إلى [railway.app](https://railway.app)
2. اضغط **"Login"**
3. اختر **"Login with GitHub"**
4. اسمح للصلاحيات

### 4️⃣ إنشاء مشروع جديد

1. اضغط **"New Project"**
2. اختر **"Deploy from GitHub repo"**
3. اختر مستودع `whatsapp-bot-redz`
4. اضغط **"Deploy now"**

### 5️⃣ إضافة قاعدة البيانات

1. من لوحة المشروع، اضغط **"+ New"**
2. اختر **"Database"**
3. اختر **"Add PostgreSQL"**
4. انتظر حتى يكتمل الإعداد

### 6️⃣ ربط قاعدة البيانات بالتطبيق

1. اضغط على **PostgreSQL** من قائمة الخدمات
2. اذهب إلى تبويب **"Connect"**
3. انسخ **"Postgres Connection URL"**

### 7️⃣ إعداد متغيرات البيئة

1. اضغط على اسم التطبيق (whatsapp-bot-redz)
2. اذهب إلى تبويب **"Variables"**
3. أضف هذه المتغيرات:

```env
DATABASE_URL=نتغيرها_في_الخطوة_التالية
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-very-long-random-secret-here-at-least-64-characters
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
BOT_SLEEP_START=00:00
BOT_SLEEP_END=07:00
MAX_DAILY_VIDEOS=3
```

4. **مهم:** استبدل `DATABASE_URL` بالرابط الذي نسخته من قاعدة البيانات

### 8️⃣ إضافة ملف خاص بـ Railway

إنشاء ملف `railway.toml` في جذر المشروع:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run build && npm start"
restartPolicyType = "always"

[[services]]
name = "whatsapp-bot"

[services.variables]
NODE_ENV = "production"
PORT = "5000"
```

### 9️⃣ إضافة ملف package.json للإنتاج

تأكد أن `package.json` يحتوي على:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts",
    "db:push": "drizzle-kit push"
  }
}
```

### 🔟 إعادة النشر

1. ارجع إلى GitHub
2. ارفع الملفات الجديدة (`railway.toml`)
3. Railway سيعيد النشر تلقائياً

---

## 🎯 الوصول للبوت

### الحصول على رابط التطبيق:
1. من لوحة Railway، اضغط على التطبيق
2. اذهب إلى تبويب **"Settings"**
3. في قسم **"Domains"**، اضغط **"Generate Domain"**
4. ستحصل على رابط مثل: `https://your-app.up.railway.app`

### تشغيل migration قاعدة البيانات:
1. من Railway، اذهب لتبويب **"Deployments"**
2. اضغط على آخر deployment
3. اذهب إلى **"View Logs"**
4. تأكد أن التطبيق يعمل بدون أخطاء

---

## 🔧 إدارة التطبيق

### مراقبة الاستهلاك:
1. من لوحة المشروع، انظر إلى **"Usage"**
2. تابع استهلاك الـ 5$ الشهرية
3. إذا اقتربت من النهاية، فكر في الانتقال لـ DigitalOcean

### مشاهدة اللوجز:
1. اضغط على التطبيق
2. اذهب إلى **"Deployments"**
3. اضغط على آخر deployment
4. **"View Logs"** لمشاهدة الأخطاء

### إعادة النشر:
- أي تغيير في GitHub سيعيد النشر تلقائياً
- أو من Railway: **"Deployments" → "Redeploy"**

---

## 🚨 استكشاف الأخطاء

### إذا فشل البناء:
```bash
# تحقق من لوجز البناء
# عادة المشكلة في package.json أو متغيرات البيئة
```

### إذا لم يتصل بقاعدة البيانات:
1. تأكد من `DATABASE_URL` صحيح
2. تحقق من أن PostgreSQL يعمل في Railway

### إذا لم يعمل WhatsApp:
- Railway لا يدعم Puppeteer بشكل مثالي
- قد تحتاج إضافة buildpack خاص للـ Chrome

---

## 💡 نصائح مهمة

### توفير الاستهلاك:
- استخدم `sleep mode` في الليل
- أوقف البوت عند عدم الحاجة

### النسخ الاحتياطية:
- Railway يحفظ نسخ تلقائية من قاعدة البيانات
- يمكنك تصدير البيانات من تبويب PostgreSQL

### مراقبة الأداء:
- تابع استهلاك الذاكرة في **"Metrics"**
- إذا تجاوزت الحدود، فكر في الترقية

---

## 🔄 متى تنتقل لحل مدفوع؟

انتقل لـ **DigitalOcean** أو **Vultr** عندما:
- ✅ تنفد الـ 5$ الشهرية
- ✅ تريد أداء أفضل
- ✅ تحتاج تحكم أكبر في الخادم
- ✅ ترغب في استضافة احترافية

---

**جاهز للبدء؟** اتبع الخطوات وأخبرني إذا واجهت أي مشكلة!