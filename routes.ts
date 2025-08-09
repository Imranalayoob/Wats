import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { whatsappBot } from "./services/whatsapp-bot";
import { urlShortener } from "./services/url-shortener";
import { insertMemberSchema, insertSettingSchema } from "@shared/schema";
import { z } from "zod";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Bot status and control routes
  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = whatsappBot.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  app.post("/api/bot/start", async (req, res) => {
    try {
      await whatsappBot.start();
      res.json({ success: true, message: "Bot starting..." });
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  app.post("/api/bot/stop", async (req, res) => {
    try {
      await whatsappBot.stop();
      res.json({ success: true, message: "Bot stopped" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  // Members management routes
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      
      // Check if phone already exists
      const existingMember = await storage.getMemberByPhone(validatedData.phone);
      if (existingMember) {
        return res.status(409).json({ error: "Member with this phone number already exists" });
      }

      const member = await storage.createMember(validatedData);
      
      // Register with bot and send welcome message
      await whatsappBot.registerMemberFromWeb(validatedData.phone, validatedData.nickname);
      
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", async (req, res) => {
    try {
      const updates = req.body;
      const member = await storage.updateMember(req.params.id, updates);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const success = await storage.deleteMember(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // Videos management routes
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/today", async (req, res) => {
    try {
      const videos = await storage.getTodayVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's videos" });
    }
  });

  app.get("/api/videos/member/:memberId", async (req, res) => {
    try {
      const videos = await storage.getVideosByMember(req.params.memberId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member videos" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const stats = await storage.getOverallStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overview stats" });
    }
  });

  app.get("/api/analytics/member/:memberId", async (req, res) => {
    try {
      const stats = await storage.getMemberStats(req.params.memberId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member stats" });
    }
  });

  // Interactions and engagement routes
  app.get("/api/interactions", async (req, res) => {
    try {
      const interactions = await storage.getTodayInteractions();
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  app.get("/api/interactions/member/:memberId", async (req, res) => {
    try {
      const interactions = await storage.getInteractionsByMember(req.params.memberId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member interactions" });
    }
  });

  // Bot logs routes
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getBotLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot logs" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(validatedData);
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid setting data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  // Bulk operations
  app.post("/api/members/bulk-message", async (req, res) => {
    try {
      const { phones, message } = req.body;
      
      if (!Array.isArray(phones) || !message) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const result = await whatsappBot.sendBulkMessage(phones, message);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to send bulk message" });
    }
  });

  app.post("/api/members/reset-daily-counts", async (req, res) => {
    try {
      await storage.resetDailyVideoCounts();
      res.json({ success: true, message: "Daily video counts reset" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset daily counts" });
    }
  });

  // Download routes
  app.post("/api/download/generate-zip", async (req, res) => {
    try {
      
      const zip = new AdmZip();
      const projectRoot = process.cwd();
      
      // Add main files to zip
      const filesToInclude = [
        'package.json',
        'vite.config.ts',
        'tailwind.config.ts',
        'tsconfig.json',
        'drizzle.config.ts',
        'postcss.config.js',
        'components.json',
        'railway.toml',
        'nixpacks.toml'
      ];
      
      // Add directories to zip
      const dirsToInclude = [
        'client',
        'server', 
        'shared',
        'deployment'
      ];
      
      // Add individual files safely
      for (const file of filesToInclude) {
        const filePath = path.join(projectRoot, file);
        try {
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath);
            zip.addFile(file, fileContent);
          }
        } catch (fileError) {
          console.log(`Skipping file ${file}: ${fileError.message}`);
        }
      }
      
      // Add directories safely
      for (const dir of dirsToInclude) {
        const dirPath = path.join(projectRoot, dir);
        try {
          if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            zip.addLocalFolder(dirPath, dir);
          }
        } catch (dirError) {
          console.log(`Skipping directory ${dir}: ${dirError.message}`);
        }
      }
      
      // Create README
      const readme = `# 🤖 بوت الواتساب لمجموعة ريدز

## آخر التحديثات (يناير 2025)
- ✅ قبول روابط ريدز فقط (redzapp.app.link + thexapp.app.link)
- ✅ رفض الروابط الأخرى برسائل عربية
- ✅ إرسال روابط مباشرة (بدون تقصير)
- ✅ جاهز للنشر على Railway (مجاني) أو DigitalOcean
- ✅ سكريبتات تثبيت تلقائية

## التشغيل السريع

### النشر على Railway (مجاني):
1. ارفع على GitHub
2. سجل دخول على railway.app
3. New Project → Deploy from GitHub
4. أضف PostgreSQL
5. اعدل متغيرات البيئة

### النشر على DigitalOcean (4$/شهر):
\`\`\`bash
curl -sSL https://raw.githubusercontent.com/deployment/digitalocean-setup.sh | bash
\`\`\`

## التشغيل المحلي
1. \`npm install\`
2. \`npm run db:push\`
3. \`npm run dev\`

## المتطلبات
- Node.js 18+
- PostgreSQL 12+
- Chromium للبوت

## الميزات الرئيسية
- 🎥 قبول روابط ريدز فقط
- 👥 إدارة الأعضاء (موافقة، إيقاف، إحصائيات)
- 🌙 وضع السبات (12 ليلاً - 7 صباحاً)
- 🔢 حد أقصى 3 فيديوهات يومياً لكل عضو
- 📊 لوحة تحكم شاملة مع إحصائيات
- 🌐 واجهة عربية RTL مع الوضع الليلي
- 📱 تصميم متجاوب

## ملفات النشر
- \`deployment/RAILWAY_GUIDE.md\` - دليل Railway المجاني
- \`deployment/DIGITALOCEAN_GUIDE.md\` - دليل DigitalOcean
- \`deployment/HOSTING_ALTERNATIVES.md\` - مقارنة الخيارات
- \`railway.toml\` + \`nixpacks.toml\` - إعدادات Railway

تم تطوير وتحديث هذا المشروع بواسطة مساعد Replit الذكي - يناير 2025
`;
      
      zip.addFile("README.md", Buffer.from(readme, "utf8"));
      
      const zipBuffer = zip.toBuffer();
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=whatsapp-bot.zip'
      });
      
      res.send(zipBuffer);
      
    } catch (error) {
      console.error('Error generating zip:', error);
      res.status(500).json({ error: "Failed to generate zip file" });
    }
  });

  // Member approval routes
  app.post("/api/members/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await whatsappBot.approveMember(id);
      
      if (success) {
        res.json({ success: true, message: "Member approved successfully" });
      } else {
        res.status(404).json({ error: "Member not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to approve member" });
    }
  });

  app.post("/api/members/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const success = await whatsappBot.rejectMember(id, reason);
      
      if (success) {
        res.json({ success: true, message: "Member rejected successfully" });
      } else {
        res.status(404).json({ error: "Member not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to reject member" });
    }
  });

  // Short URL redirect handler
  app.get("/s/:shortCode", async (req, res) => {
    try {
      const { shortCode } = req.params;
      const urlData = await urlShortener.getOriginalUrl(shortCode);
      
      if (!urlData) {
        return res.status(404).json({ error: "Short URL not found" });
      }

      // Log the click with user agent info
      await storage.createInteraction({
        memberId: urlData.memberId,
        videoId: shortCode,
        type: 'click',
        metadata: {
          userAgent: req.headers['user-agent'] || 'unknown',
          ip: req.ip,
          clickedAt: new Date().toISOString()
        }
      });

      // Redirect to original URL
      res.redirect(urlData.url);
    } catch (error) {
      res.status(500).json({ error: "Failed to process redirect" });
    }
  });

  // URL analytics
  app.get("/api/urls/stats", async (req, res) => {
    try {
      const urls = await urlShortener.getAllUrls();
      res.json(urls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URL stats" });
    }
  });

  app.get("/api/urls/stats/:shortCode", async (req, res) => {
    try {
      const stats = await urlShortener.getClickStats(req.params.shortCode);
      if (!stats) {
        return res.status(404).json({ error: "Short URL not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch URL stats" });
    }
  });

  const httpServer = createServer(app);

  // Initialize bot when server starts
  setTimeout(() => {
    whatsappBot.start().catch(console.error);
  }, 2000);

  return httpServer;
}
