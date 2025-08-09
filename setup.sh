#!/bin/bash

# WhatsApp Bot Auto Setup Script for Contabo VPS
# Author: Bot Assistant
# Date: January 2025

set -e

echo "🚀 بدء تثبيت بوت الواتساب على VPS..."

# Update system
echo "📦 تحديث النظام..."
apt update && apt upgrade -y

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

# Create database
echo "🔐 إعداد قاعدة البيانات..."
sudo -u postgres createuser --interactive --pwprompt whatsappbot
sudo -u postgres createdb whatsappbot_db -O whatsappbot

# Create app directory
echo "📁 إنشاء مجلد التطبيق..."
mkdir -p /opt/whatsapp-bot
cd /opt/whatsapp-bot

# Set permissions
chown -R $USER:$USER /opt/whatsapp-bot

echo "✅ تم الانتهاء من التثبيت الأساسي!"
echo "📋 الخطوات التالية:"
echo "1. ارفع ملفات البوت إلى /opt/whatsapp-bot"
echo "2. قم بتشغيل npm install"
echo "3. أضف متغيرات البيئة في ملف .env"
echo "4. شغل البوت باستخدام pm2 start ecosystem.config.js"