# دليل نشر بوت الواتساب على Contabo VPS

## المتطلبات:
- Contabo VPS S (4€/شهر) - 4GB RAM, 50GB SSD
- نطاق (دومين) للوصول للبوت (اختياري لكن مُوصى به)

## الخطوات:

### 1. شراء VPS من Contabo
- اذهب إلى [contabo.com](https://contabo.com)
- اختر VPS S (4€/شهر)
- نظام التشغيل: Ubuntu 20.04 أو 22.04
- Region: Europe (أقرب للشرق الأوسط)

### 2. الاتصال بالـ VPS
```bash
ssh root@YOUR_VPS_IP
```

### 3. تشغيل سكربت التثبيت التلقائي
```bash
# تحميل وتشغيل سكربت الإعداد
wget https://raw.githubusercontent.com/your-repo/whatsapp-bot/main/deployment/setup.sh
chmod +x setup.sh
./setup.sh
```

### 4. رفع ملفات المشروع
```bash
# أنشئ مجلد للمشروع
cd /opt/whatsapp-bot

# ارفع الملفات (استخدم scp أو git)
# مثال باستخدام git:
git clone https://github.com/your-repo/whatsapp-bot.git .

# تثبيت المكتبات
npm install
```

### 5. إعداد قاعدة البيانات
```bash
# إنشاء كلمة مرور لقاعدة البيانات
sudo -u postgres psql
# داخل PostgreSQL:
ALTER USER whatsappbot PASSWORD 'your_secure_password';
\q
```

### 6. إعداد متغيرات البيئة
```bash
# انسخ ملف البيئة المثال
cp deployment/.env.example .env

# عدّل الملف بمعلوماتك
nano .env
```

**ضع هذه القيم في ملف .env:**
```env
DATABASE_URL="postgresql://whatsappbot:your_secure_password@localhost:5432/whatsappbot_db"
NODE_ENV=production
PORT=5000
BASE_URL=https://your-domain.com
SESSION_SECRET=your-very-long-random-session-secret
```

### 7. تشغيل قاعدة البيانات (Migration)
```bash
npm run db:push
```

### 8. تشغيل البوت
```bash
# انسخ ملف PM2
cp deployment/ecosystem.config.js .

# إنشاء مجلد اللوجز
mkdir logs

# تشغيل البوت بـ PM2
pm2 start ecosystem.config.js

# حفظ إعدادات PM2 للتشغيل التلقائي
pm2 save
pm2 startup
```

### 9. إعداد Nginx (اختياري - للدومين)
```bash
# إذا كان لديك دومين:
sudo cp deployment/nginx.conf /etc/nginx/sites-available/whatsapp-bot
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 10. إعداد SSL (اختياري - للأمان)
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx
# الحصول على SSL certificate
sudo certbot --nginx -d your-domain.com
```

## التحقق من عمل البوت:

### مراقبة اللوجز:
```bash
# مشاهدة لوجز البوت مباشرة
pm2 logs whatsapp-bot

# حالة البوت
pm2 status

# إعادة تشغيل البوت
pm2 restart whatsapp-bot
```

### الوصول للوحة التحكم:
- افتح المتصفح واذهب إلى: `http://YOUR_VPS_IP:5000`
- أو إذا أعددت دومين: `https://your-domain.com`

### اختبار البوت:
1. امسح QR Code من لوحة التحكم بالواتساب
2. أرسل "ريدز" لرقم البوت
3. اتبع التعليمات

## استكشاف الأخطاء:

### إذا لم يعمل البوت:
```bash
# تحقق من الحالة
pm2 status
pm2 logs whatsapp-bot

# تحقق من قاعدة البيانات
sudo -u postgres psql -d whatsappbot_db -c "\dt;"
```

### إذا لم يتصل بـ WhatsApp:
- تأكد من أن Chromium مثبت
- تحقق من أن المنافذ مفتوحة
- أعد تشغيل البوت

## الأوامر المفيدة:

```bash
# إيقاف البوت
pm2 stop whatsapp-bot

# حذف البوت من PM2
pm2 delete whatsapp-bot

# مراقبة الموارد
pm2 monit

# تحديث البوت (بعد رفع كود جديد)
git pull
npm install
pm2 restart whatsapp-bot
```

---

## ملاحظات مهمة:

1. **الأمان**: غيّر جميع كلمات المرور الافتراضية
2. **النسخ الاحتياطي**: اعمل نسخة احتياطية من قاعدة البيانات بانتظام
3. **المراقبة**: راقب استهلاك الذاكرة والمعالج
4. **التحديثات**: حدّث النظام والتطبيق بانتظام

**الدعم**: إذا واجهت مشاكل، تحقق من اللوجز أولاً باستخدام `pm2 logs`