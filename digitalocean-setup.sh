#!/bin/bash

# DigitalOcean WhatsApp Bot Auto Setup Script
# Author: Bot Assistant
# Date: January 2025

set -e

echo "🌊 بدء تثبيت بوت الواتساب على DigitalOcean..."

# Update system
echo "📦 تحديث النظام..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 تثبيت الحزم الأساسية..."
apt install -y curl wget git unzip htop nano ufw

# Install Node.js 18.x
echo "📥 تثبيت Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
echo "🗄️ تثبيت قاعدة البيانات PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Chromium for WhatsApp Web
echo "🌐 تثبيت Chromium..."
apt install -y chromium-browser

# Install PM2 globally
echo "⚙️ تثبيت PM2..."
npm install -g pm2

# Install Nginx
echo "🔧 تثبيت Nginx..."
apt install -y nginx

# Configure firewall
echo "🔥 إعداد الجدار الناري..."
ufw allow OpenSSH
ufw allow 5000
ufw allow 'Nginx Full'
ufw --force enable

# Start and enable services
echo "🚀 تشغيل الخدمات..."
systemctl start postgresql
systemctl enable postgresql
systemctl start nginx
systemctl enable nginx

# Create PostgreSQL user and database
echo "🔐 إعداد قاعدة البيانات..."
sudo -u postgres psql -c "CREATE USER whatsappbot WITH PASSWORD 'WhatsApp@2025';"
sudo -u postgres psql -c "CREATE DATABASE whatsappbot_db OWNER whatsappbot;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whatsappbot_db TO whatsappbot;"

# Create app directory and set permissions
echo "📁 إنشاء مجلد التطبيق..."
mkdir -p /opt/whatsapp-bot
mkdir -p /opt/whatsapp-bot/logs
chown -R $USER:$USER /opt/whatsapp-bot
cd /opt/whatsapp-bot

# Create basic nginx config
echo "🌐 إعداد Nginx..."
cat > /etc/nginx/sites-available/whatsapp-bot << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for WhatsApp operations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable nginx site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Create .env template
echo "📝 إنشاء ملف البيئة..."
cat > /opt/whatsapp-bot/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://whatsappbot:WhatsApp@2025@localhost:5432/whatsappbot_db"

# Server Configuration
NODE_ENV=production
PORT=5000

# Security - CHANGE THIS!
SESSION_SECRET="change-this-to-a-very-long-random-string-at-least-64-characters-long"

# Chrome Configuration
CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Bot Configuration
BOT_SLEEP_START=00:00
BOT_SLEEP_END=07:00
MAX_DAILY_VIDEOS=3
EOF

# Create PM2 ecosystem file
echo "🏗️ إنشاء ملف PM2..."
cat > /opt/whatsapp-bot/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'server/index.ts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Install tsx globally for PM2
echo "📦 تثبيت tsx..."
npm install -g tsx

echo ""
echo "✅ تم الانتهاء من التثبيت الأساسي!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. ارفع ملفات البوت إلى /opt/whatsapp-bot"
echo "2. cd /opt/whatsapp-bot && npm install"
echo "3. عدّل ملف .env وغير SESSION_SECRET"
echo "4. npm run db:push"
echo "5. pm2 start ecosystem.config.js"
echo "6. pm2 save && pm2 startup"
echo ""
echo "🌐 للوصول للبوت: http://$(curl -s ifconfig.me):5000"
echo ""
echo "🔧 أوامر مفيدة:"
echo "   pm2 status      - حالة البوت"
echo "   pm2 logs        - عرض اللوجز"
echo "   pm2 restart all - إعادة تشغيل"
echo ""