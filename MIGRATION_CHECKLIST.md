# ✅ قائمة تحقق الهجرة

## قبل النشر - احفظ هذه المعلومات:

### 🔐 الإعدادات من Replit الحالي:
```bash
# شغل هذا الأمر في Terminal الحالي لرؤية إعداداتك:
node deployment/export-current-env.js
```

### 📝 المعلومات المطلوبة:
- [ ] رابط قاعدة البيانات الحالي
- [ ] SESSION_SECRET الحالي (ستحتاج توليد جديد)
- [ ] إعدادات البوت (أوقات السبات، حد الفيديوهات)
- [ ] كلمات مرور الإدارة (إن وجدت)

---

## خطوات الهجرة:

### 📦 1. تحميل الملفات
- [ ] اذهب لصفحة "تحميل" في لوحة التحكم
- [ ] اضغط "إنشاء ملف ZIP"
- [ ] اضغط "تحميل الملف"

### 🔑 2. تحضير متغيرات البيئة
- [ ] افتح `deployment/ENV_SETUP_GUIDE.md`
- [ ] ولد SESSION_SECRET جديد (64+ حرف)
- [ ] جهز إعدادات قاعدة البيانات الجديدة

### 🚂 3. للنشر على Railway:
- [ ] ارفع الملفات على GitHub
- [ ] إنشاء مشروع Railway
- [ ] ربط المستودع
- [ ] إضافة PostgreSQL
- [ ] إعداد متغيرات البيئة:
  ```
  DATABASE_URL=سيتم_إنشاؤه_تلقائياً
  SESSION_SECRET=مفتاحك_الجديد_64_حرف
  NODE_ENV=production
  PORT=5000
  BOT_SLEEP_START=00:00
  BOT_SLEEP_END=07:00
  MAX_DAILY_VIDEOS=3
  ```

### 🌊 4. للنشر على DigitalOcean:
- [ ] إنشاء Droplet (Ubuntu 22.04)
- [ ] تشغيل سكريبت الإعداد:
  ```bash
  curl -sSL https://raw.githubusercontent.com/deployment/digitalocean-setup.sh | bash
  ```
- [ ] رفع الملفات ل `/opt/whatsapp-bot`
- [ ] تحرير ملف `.env`:
  ```bash
  nano /opt/whatsapp-bot/.env
  ```
- [ ] تشغيل البوت:
  ```bash
  npm install
  npm run db:push  
  pm2 start ecosystem.config.js
  ```

---

## بعد النشر - تحقق من:

### ✅ الخادم:
- [ ] البوت يعمل بدون أخطاء
- [ ] قاعدة البيانات متصلة
- [ ] لوحة التحكم تفتح
- [ ] QR Code يظهر للاتصال بـ WhatsApp

### ✅ البوت:
- [ ] امسح QR Code بالواتساب
- [ ] أرسل "ريدز" للبوت
- [ ] اختبر رابط ريدز صحيح
- [ ] اختبر رفض رابط خاطئ
- [ ] تحقق من ظهور الإحصائيات

### ✅ الأداء:
- [ ] مراقبة استهلاك الذاكرة
- [ ] تحقق من لوجز الأخطاء
- [ ] اختبار تشغيل مستمر 24 ساعة

---

## 🆘 إذا واجهت مشاكل:

### Railway:
```bash
# من لوحة Railway:
# Deployments → View Logs
```

### DigitalOcean:
```bash
# عبر SSH:
pm2 logs whatsapp-bot
pm2 status
systemctl status postgresql
```

### مشاكل شائعة:
- **البوت لا يتصل بـ WhatsApp:** تحقق من Chrome/Chromium
- **خطأ قاعدة البيانات:** تحقق من DATABASE_URL
- **لوحة التحكم لا تفتح:** تحقق من PORT والـ firewall

---

## 📞 دعم إضافي:
راجع الأدلة المفصلة في:
- `deployment/RAILWAY_GUIDE.md`
- `deployment/DIGITALOCEAN_GUIDE.md`
- `deployment/ENV_SETUP_GUIDE.md`