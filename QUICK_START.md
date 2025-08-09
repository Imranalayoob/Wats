# 🚀 البدء السريع - نشر البوت (5 دقائق)

## الخيار 1: Railway (مجاني) ⭐ مُوصى للبداية

1. **رفع على GitHub:**
   - اذهب إلى [github.com/new](https://github.com/new)
   - اسم المستودع: `whatsapp-bot-redz`
   - ارفع جميع ملفات المشروع

2. **النشر على Railway:**
   - اذهب إلى [railway.app](https://railway.app)
   - سجل دخول بـ GitHub
   - **New Project** → **Deploy from GitHub**
   - اختر مستودع `whatsapp-bot-redz`

3. **إضافة قاعدة البيانات:**
   - **+ New** → **Database** → **PostgreSQL**
   - انسخ رابط قاعدة البيانات

4. **إعداد المتغيرات:**
   ```
   DATABASE_URL=الرابط_المنسوخ
   SESSION_SECRET=كلمة-سر-طويلة-جداً-64-حرف-على-الأقل
   NODE_ENV=production
   ```

5. **الوصول للبوت:**
   - **Settings** → **Generate Domain**
   - افتح الرابط وامسح QR Code

---

## الخيار 2: DigitalOcean (4$/شهر) ⭐ للاستخدام الجدي

1. **إنشاء حساب:** [digitalocean.com](https://digitalocean.com)
2. **إنشاء Droplet:** Ubuntu 22.04, 1GB RAM
3. **تشغيل السكربت:**
   ```bash
   curl -sSL https://raw.githubusercontent.com/your-repo/deployment/digitalocean-setup.sh | bash
   ```
4. **رفع الملفات وتشغيل البوت:**
   ```bash
   cd /opt/whatsapp-bot
   # رفع الملفات
   npm install
   npm run db:push
   pm2 start ecosystem.config.js
   ```

---

## الخيار 3: Vultr (2.50$/شهر) ⭐ الأرخص

نفس خطوات DigitalOcean لكن:
- اختر خادم في دبي أو أوروبا
- 512MB RAM كافية
- نفس السكربت يعمل

---

## 📋 قائمة التحقق السريعة

- ✅ المشروع مرفوع على GitHub
- ✅ النشر تم بنجاح
- ✅ قاعدة البيانات متصلة
- ✅ متغيرات البيئة مُعرفة
- ✅ البوت يعمل بدون أخطاء
- ✅ QR Code يظهر في لوحة التحكم
- ✅ البوت متصل بالواتساب

---

**أي مشكلة؟** راجع الأدلة المفصلة في مجلد `deployment/`