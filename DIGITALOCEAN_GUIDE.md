# 🌊 دليل نشر البوت على DigitalOcean

## لماذا DigitalOcean؟
- ✅ **يقبل البطاقات العربية** بسهولة
- ✅ **واجهة بسيطة** وسهلة الاستخدام
- ✅ **سمعة ممتازة** - يثق به ملايين المطورين
- ✅ **دعم فني ممتاز** 24/7
- ✅ **خوادم سريعة** في أوروبا (قريبة من الشرق الأوسط)

---

## الخطوات:

### 1️⃣ إنشاء حساب DigitalOcean

1. اذهب إلى [digitalocean.com](https://www.digitalocean.com)
2. اضغط **"Sign Up"**
3. أدخل بريدك الإلكتروني وكلمة مرور قوية
4. أكد بريدك الإلكتروني

### 2️⃣ إضافة طريقة الدفع

1. اذهب إلى **"Account" → "Billing"**
2. اضغط **"Add Payment Method"**
3. **جرب هذه الطرق بالترتيب:**
   - **PayPal** (الأسهل إذا كان لديك حساب)
   - **بطاقة فيزا/ماستركارد** (تأكد أنها مفعلة للدفع الدولي)
   - **بطاقة ائتمانية دولية**

### 3️⃣ إنشاء Droplet (الخادم)

1. اضغط **"Create" → "Droplets"**
2. **اختر الإعدادات التالية:**
   ```
   📍 Region: Frankfurt (أقرب للشرق الأوسط)
   💾 Image: Ubuntu 22.04 LTS
   📦 Size: Basic Plan
   💰 CPU: Regular Intel - $4/month (1GB RAM)
   🔑 Authentication: SSH Key (أفضل) أو Password
   ```

3. **أعطي الخادم اسم:** `whatsapp-bot-server`
4. اضغط **"Create Droplet"**

### 4️⃣ الاتصال بالخادم

**إذا اخترت Password:**
```bash
ssh root@YOUR_DROPLET_IP
```

**إذا اخترت SSH Key:**
```bash
ssh -i your-private-key root@YOUR_DROPLET_IP
```

### 5️⃣ تثبيت البوت (نسخ ولصق فقط!)

```bash
# نسخ ولصق هذا الكود بالكامل:
curl -sSL https://raw.githubusercontent.com/your-repo/whatsapp-bot/main/deployment/digitalocean-setup.sh | bash
```

هذا السكربت سيفعل كل شيء تلقائياً:
- ✅ تحديث النظام
- ✅ تثبيت Node.js
- ✅ تثبيت PostgreSQL  
- ✅ تثبيت Chromium
- ✅ إعداد PM2
- ✅ إعداد Nginx
- ✅ إنشاء قاعدة البيانات

### 6️⃣ رفع ملفات البوت

```bash
# إنشاء مجلد المشروع
cd /opt/whatsapp-bot

# رفع الملفات (اختر طريقة واحدة):

# الطريقة 1: Git (إذا رفعت المشروع على GitHub)
git clone https://github.com/your-username/whatsapp-bot.git .

# الطريقة 2: رفع مباشر (استخدم WinSCP أو FileZilla)
# ارفع كل الملفات من مجلد المشروع إلى /opt/whatsapp-bot
```

### 7️⃣ إعداد البيئة والتشغيل

```bash
# تثبيت المكتبات
npm install

# إعداد البيئة
cp deployment/.env.example .env
nano .env
```

**في ملف .env، غير هذه القيم:**
```env
DATABASE_URL="postgresql://whatsappbot:YourStrongPassword123@localhost:5432/whatsappbot_db"
SESSION_SECRET="your-very-long-random-secret-at-least-64-characters-here"
BASE_URL=http://YOUR_DROPLET_IP:5000
```

```bash
# إعداد قاعدة البيانات
npm run db:push

# تشغيل البوت
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# التحقق من التشغيل
pm2 status
pm2 logs whatsapp-bot
```

### 8️⃣ الوصول للبوت

افتح المتصفح واذهب إلى:
```
http://YOUR_DROPLET_IP:5000
```

---

## 🔧 إدارة الخادم

### مراقبة البوت:
```bash
# حالة البوت
pm2 status

# اللوجز المباشرة
pm2 logs whatsapp-bot

# إعادة التشغيل
pm2 restart whatsapp-bot

# إيقاف البوت
pm2 stop whatsapp-bot
```

### إدارة الخادم:
```bash
# مراقبة استهلاك الموارد
htop

# مساحة القرص
df -h

# الذاكرة
free -h

# إعادة تشغيل الخادم
reboot
```

---

## 💰 التكلفة

| المكون | السعر |
|---------|--------|
| Droplet (1GB RAM) | $4/شهر |
| Transfer (1TB) | مجاني |
| Backup (اختياري) | $0.80/شهر |
| **الإجمالي** | **$4-5/شهر** |

---

## 🆘 استكشاف الأخطاء

### إذا فشل التثبيت:
```bash
# تحقق من اللوجز
journalctl -xe

# إعادة تشغيل الخدمات
systemctl restart postgresql
systemctl restart nginx
```

### إذا لم يعمل البوت:
```bash
pm2 logs whatsapp-bot
pm2 restart whatsapp-bot
```

### إذا لم تفتح لوحة التحكم:
```bash
# تحقق من المنافذ
sudo ufw status
sudo ufw allow 5000

# تحقق من النايتروجين
sudo systemctl status nginx
```

---

## 🎉 تهانينا!

البوت الآن يعمل 24/7 على خادم احترافي!

**للدعم:** تابع اللوجز باستخدام `pm2 logs whatsapp-bot`