import { Client, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';

// LocalAuth is currently having export issues, let's create a simple auth alternative
class SimpleAuth {
  constructor(options: any = {}) {}
}
import { storage } from '../storage';
import { urlShortener } from './url-shortener';

export class WhatsAppBot {
  private client: Client;
  private isReady = false;
  private qrCode: string | null = null;

  constructor() {
    this.client = new Client({
      puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code received, generating image...');
      this.qrCode = await QRCode.toDataURL(qr);
      
      await storage.createBotLog({
        type: 'message_sent',
        message: 'QR Code generated for WhatsApp authentication',
        metadata: { qrLength: qr.length }
      });
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp Bot is ready!');
      this.isReady = true;
      this.qrCode = null;
      
      await storage.createBotLog({
        type: 'message_sent',
        message: 'Bot is ready and connected to WhatsApp',
        metadata: { timestamp: new Date().toISOString() }
      });
    });

    this.client.on('message', async (message: Message) => {
      await this.handleIncomingMessage(message);
    });

    this.client.on('disconnected', async (reason) => {
      console.log('WhatsApp Bot disconnected:', reason);
      this.isReady = false;
      
      await storage.createBotLog({
        type: 'error',
        message: `Bot disconnected: ${reason}`,
        metadata: { reason }
      });
    });

    this.client.on('auth_failure', async (message) => {
      console.log('Authentication failed:', message);
      
      await storage.createBotLog({
        type: 'error',
        message: `Authentication failed: ${message}`,
        metadata: { error: message }
      });
    });
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Failed to start WhatsApp bot:', error);
      await storage.createBotLog({
        type: 'error',
        message: `Failed to start bot: ${error}`,
        metadata: { error: String(error) }
      });
    }
  }

  async stop() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      qrCode: this.qrCode
    };
  }

  private async isSleepTime(): Promise<boolean> {
    try {
      // Check if sleep mode is enabled
      const sleepModeSetting = await storage.getSetting('sleep_mode_enabled');
      const sleepModeEnabled = sleepModeSetting?.value !== false;
      
      if (!sleepModeEnabled) {
        return false;
      }
      
      const now = new Date();
      const currentHour = now.getHours();
      
      // Sleep mode: 12 AM (0) to 7 AM (7) - exclusive of 7 AM
      return currentHour >= 0 && currentHour < 7;
    } catch (error) {
      console.error('Error checking sleep time:', error);
      return false;
    }
  }

  private async isAdminPhone(phone: string): Promise<boolean> {
    try {
      const adminPhoneSetting = await storage.getSetting('admin_phone');
      const backupAdminSetting = await storage.getSetting('backup_admin_phone');
      
      const adminPhone = adminPhoneSetting?.value as string;
      const backupAdminPhone = backupAdminSetting?.value as string;
      
      // Clean phone numbers for comparison (remove spaces, dashes, etc.)
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const cleanAdminPhone = adminPhone?.replace(/[^\d+]/g, '') || '';
      const cleanBackupPhone = backupAdminPhone?.replace(/[^\d+]/g, '') || '';
      
      return cleanPhone === cleanAdminPhone || cleanPhone === cleanBackupPhone;
    } catch (error) {
      console.error('Error checking admin phone:', error);
      return false;
    }
  }

  private async handleIncomingMessage(message: Message) {
    try {
      const contact = await message.getContact();
      const phone = contact.number;
      const messageBody = message.body.trim();

      // Log received message
      await storage.createBotLog({
        type: 'message_received',
        message: `Received from ${phone}: ${messageBody}`,
        metadata: { phone, messageBody }
      });

      // Send immediate typing indicator for responsiveness
      const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
      try {
        await this.client.sendSeen(chatId);
      } catch (e) {
        // Ignore if typing indicator fails
      }

      // Check if bot is in sleep mode (12 AM to 7 AM) - except for admin
      if ((await this.isSleepTime()) && !(await this.isAdminPhone(phone))) {
        await this.sendMessage(phone, '😴 البوت في حالة سبات من الساعة 12:00 ليلاً حتى الساعة 7:00 صباحاً\n\nيرجى المحاولة مرة أخرى في الصباح لتجنب إزعاج الأعضاء الآخرين.');
        return;
      }

      // Check if member exists
      let member = await storage.getMemberByPhone(phone);

      if (!member) {
        // New user - only respond to "ريدز" or "REDZ" keyword
        const normalizedMessage = this.normalizeArabicText(messageBody.toLowerCase());
        if (normalizedMessage === 'ريدز' || normalizedMessage === 'redz') {
          
          // Create member with pending status
          member = await storage.createMember({ 
            phone, 
            nickname: `عضو ${phone.slice(-4)}`,
            status: 'pending'
          });
          
          await this.sendTermsAndConditions(phone);
          return;
        } else {
          // Ignore all other messages from non-members
          return;
        }
      }

      // Handle different message types
      if (messageBody.toLowerCase().includes('موافق') || 
          messageBody.toLowerCase().includes('أوافق') || 
          messageBody.toLowerCase().includes('نعم')) {
        
        if (member.status === 'suspended') {
          await this.sendMessage(phone, 'عذراً، تم إيقاف عضويتك مؤقتاً. تواصل مع الإدارة للمساعدة.');
          return;
        }
        
        if (member.status === 'pending') {
          // Update status to awaiting admin approval
          await storage.updateMember(member.id, { status: 'awaiting_approval' });
          
          await this.sendMessage(phone, '✅ شكراً لك على الموافقة على الشروط!\n\n⏳ تم إرسال طلبك للإدارة للموافقة النهائية. سيتم إشعارك عند قبول طلبك.');
          
          // Notify admin
          await this.notifyAdminForApproval(member);
          return;
        } else if (member.status === 'awaiting_approval') {
          await this.sendMessage(phone, '⏳ طلبك قيد المراجعة من الإدارة. يرجى الانتظار.');
          return;
        } else if (member.status === 'active') {
          await this.sendInstructions(phone);
          return;
        }
      }

      if (messageBody.toLowerCase().includes('لا') || messageBody.toLowerCase().includes('رفض')) {
        if (member) {
          await storage.updateMember(member.id, { status: 'inactive' });
        }
        await this.sendMessage(phone, 'شكراً لك. يمكنك العودة والانضمام في أي وقت بكتابة "ريدز" أو "REDZ".');
        return;
      }

      // Check if message contains invalid URL
      if (this.isInvalidUrl(messageBody)) {
        await this.sendMessage(phone, '❌ عذراً، نقبل فقط روابط ريدز!\n\n✅ يرجى إرسال روابط تبدأ بـ:\n• https://redzapp.app.link/\n• https://thexapp.app.link/\n\n🚫 لا نقبل روابط من منصات أخرى');
        return;
      }

      // Check if message contains valid Redz URL
      if (this.isValidRedzUrl(messageBody)) {
        await this.handleVideoSubmission(member, messageBody);
        return;
      }

      // Handle help command with flexible Arabic text
      const normalizedMessage = this.normalizeArabicText(messageBody.toLowerCase());
      if (this.isHelpCommand(normalizedMessage)) {
        await this.sendInstructions(phone);
        return;
      }

      // Handle stats command with flexible Arabic text
      if (this.isStatsCommand(normalizedMessage)) {
        await this.sendMemberStats(member);
        return;
      }

      // Only active members get default response
      if (member.status === 'active') {
        await this.sendMessage(phone, `لم أفهم رسالتك 🤔\n\nأرسل "مساعدة" لإرسال لك المساعدة`);
      }

    } catch (error) {
      console.error('Error handling message:', error);
      await storage.createBotLog({
        type: 'error',
        message: `Error handling message: ${error}`,
        metadata: { error: String(error) }
      });
    }
  }

  private async sendTermsAndConditions(phone: string) {
    const termsMessage = `📋 شروط وأحكام مجموعة ريدز

🎥 مجموعة تبادل الفيديوهات والريدز
📱 شارك فيديوهاتك واستمتع بمحتوى الآخرين

📝 الشروط والأحكام:
• حد أقصى 3 فيديوهات يومياً لكل عضو
• يجب التفاعل مع فيديوهات الأعضاء الآخرين
• عدم مشاركة محتوى مسيء أو غير لائق
• احترام جميع أعضاء المجموعة
• البوت في سبات من 12:00 ليلاً - 7:00 صباحاً
• عدم الإزعاج أو الرسائل العشوائية

⚠️ مخالفة الشروط قد تؤدي لإيقاف العضوية

هل توافق على هذه الشروط؟

✅ أرسل "موافق" أو "أوافق" أو "نعم" للموافقة
❌ أرسل "لا" أو "رفض" للرفض`;
    
    await this.sendMessage(phone, termsMessage);
  }

  private async sendInstructions(phone: string) {
    const instructions = await storage.getSetting('bot_instructions');
    const customMessage = instructions?.value as string;
    
    const defaultInstructions = `📝 تعليمات المجموعة:

🎥 شارك فيديوهات ريدز مثيرة للاهتمام
📊 حد أقصى 3 فيديوهات يومياً لكل عضو
❤️ تفاعل مع فيديوهات الأعضاء الآخرين
🌙 البوت في سبات من 12:00 ليلاً - 7:00 صباحاً

🔗 الروابط المقبولة فقط:
• https://redzapp.app.link/
• https://thexapp.app.link/
❌ لا نقبل روابط من منصات أخرى

📱 الأوامر المتاحة:
• إرسال رابط ريدز لمشاركته
• "احصائيات" لعرض إحصائياتك
• "مساعدة" لعرض هذه التعليمات

⚡ استجابة فورية 24/7 (عدا فترة السبات)`;
    
    const message = customMessage || defaultInstructions;
    await this.sendMessage(phone, message);
  }

  // Helper function to normalize Arabic text
  private normalizeArabicText(text: string): string {
    return text
      .replace(/[أإآ]/g, 'ا')  // Replace different alef forms
      .replace(/[ؤ]/g, 'و')    // Replace waw with hamza
      .replace(/[ئ]/g, 'ي')    // Replace yeh with hamza
      .replace(/[ة]/g, 'ه')    // Replace teh marbuta with heh
      .replace(/[ى]/g, 'ي')    // Replace alef maksura with yeh
      .replace(/[ً ٌ ٍ َ ُ ِ ّ ْ]/g, '') // Remove diacritics
      .trim();
  }

  // Helper function to check if message is help command
  private isHelpCommand(normalizedText: string): boolean {
    const helpVariants = ['مساعده', 'مساعدة', 'help'];
    return helpVariants.some(variant => normalizedText.includes(variant));
  }

  // Helper function to check if message is stats command
  private isStatsCommand(normalizedText: string): boolean {
    const statsVariants = ['احصائيات', 'احصايات', 'stats'];
    return statsVariants.some(variant => normalizedText.includes(variant));
  }

  private async notifyAdminForApproval(member: any) {
    try {
      const adminPhone = '+9647812258859'; // رقم المدير الجديد
      
      const notificationMessage = `🔔 طلب انضمام جديد

👤 العضو: ${member.nickname}
📱 الرقم: ${member.phone}
⏰ الوقت: ${new Date().toLocaleString('ar-EG')}

الحالة: في انتظار موافقة الإدارة

للموافقة على العضو، يرجى الدخول إلى لوحة التحكم.`;

      await this.sendMessage(adminPhone, notificationMessage);
      
      await storage.createBotLog({
        type: 'message_sent',
        message: `Admin notification sent for member approval: ${member.phone}`,
        metadata: { memberId: member.id, adminPhone }
      });
      
    } catch (error) {
      console.error('Error notifying admin:', error);
      await storage.createBotLog({
        type: 'error',
        message: `Failed to notify admin for member approval: ${error}`,
        metadata: { memberId: member.id, error: String(error) }
      });
    }
  }

  private async sendMemberStats(member: any) {
    const stats = await storage.getMemberStats(member.id);
    const message = `📊 إحصائياتك:
    
🎥 إجمالي الفيديوهات: ${stats.totalVideos}
❤️ إجمالي التفاعلات: ${stats.totalInteractions}  
📈 معدل التفاعل: ${stats.engagementRate}%
📅 فيديوهات اليوم: ${stats.todayVideos}/3`;

    await this.sendMessage(member.phone, message);
  }

  private isValidRedzUrl(text: string): boolean {
    const redzUrlPatterns = [
      /^https:\/\/redzapp\.app\.link\//i,
      /^https:\/\/thexapp\.app\.link\//i
    ];

    return redzUrlPatterns.some(pattern => pattern.test(text));
  }

  private isInvalidUrl(text: string): boolean {
    // Check if it's a URL but not a Redz URL
    const isUrl = /^https?:\/\//i.test(text);
    return isUrl && !this.isValidRedzUrl(text);
  }

  private async handleVideoSubmission(member: any, videoUrl: string) {
    try {
      // Check if member is active
      if (member.status !== 'active') {
        return;
      }

      // Check daily limit - get today's videos for this member
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayVideos = await storage.getVideosByDateRange(today, new Date());
      const memberTodayVideos = todayVideos.filter(v => v.memberId === member.id);
      
      const maxDailyVideos = await storage.getSetting('max_daily_videos');
      const dailyLimit = maxDailyVideos?.value as number || 3;

      if (memberTodayVideos.length >= dailyLimit) {
        await this.sendMessage(member.phone, `تم الوصول للحد الأقصى اليومي (${dailyLimit} فيديوهات). جرب غداً! 🎥`);
        return;
      }

      // Save video with original URL (no shortening)
      const video = await storage.createVideo({
        memberId: member.id,
        originalUrl: videoUrl,
        shortUrl: videoUrl, // Use original URL directly
        title: `فيديو من ${member.nickname}`
      });

      // Update member's daily count and last video time
      await storage.updateMember(member.id, { 
        dailyVideosCount: memberTodayVideos.length + 1,
        lastVideoAt: new Date()
      });

      // Send confirmation to sender
      await this.sendMessage(member.phone, 
        `✅ تم استلام الفيديو وإرساله لجميع الأعضاء!\n\n` +
        `📊 فيديوهاتك اليوم: ${memberTodayVideos.length + 1}/${dailyLimit}`
      );

      // Send to all other active members
      await this.distributeVideoToMembers(video, member);

      await storage.createBotLog({
        type: 'message_sent',
        memberId: member.id,
        message: `Video submitted and distributed: ${videoUrl}`,
        metadata: { videoId: video.id }
      });

    } catch (error) {
      console.error('Error handling video submission:', error);
      await this.sendMessage(member.phone, 'حدث خطأ أثناء معالجة الفيديو. يرجى المحاولة مرة أخرى.');
    }
  }

  private async distributeVideoToMembers(video: any, sender: any) {
    try {
      const activeMembers = await storage.getActiveMembers();
      const recipients = activeMembers.filter(member => member.id !== sender.id);

      let sentCount = 0;
      for (const member of recipients) {
        try {
          const message = `🎥 فيديو من ${sender.nickname}

${video.originalUrl}

عليك التفاعل مع الرابط`;

          await this.sendMessage(member.phone, message);
          sentCount++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to send video to ${member.phone}:`, error);
        }
      }

      // Update video stats
      await storage.updateVideo(video.id, { sentToMembers: sentCount });

    } catch (error) {
      console.error('Error distributing video:', error);
    }
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.log('Bot not ready, queuing message...');
        return false;
      }

      const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
      await this.client.sendMessage(chatId, message);
      
      await storage.createBotLog({
        type: 'message_sent',
        message: `Sent to ${phone}: ${message}`,
        metadata: { phone, messageLength: message.length }
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      await storage.createBotLog({
        type: 'error',
        message: `Failed to send message to ${phone}: ${error}`,
        metadata: { phone, error: String(error) }
      });
      return false;
    }
  }

  async sendBulkMessage(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const phone of phones) {
      const success = await this.sendMessage(phone, message);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return { sent, failed };
  }

  // Method to handle member registration from web interface
  async registerMemberFromWeb(phone: string, nickname: string): Promise<boolean> {
    try {
      // Check if member already exists
      const existingMember = await storage.getMemberByPhone(phone);
      if (existingMember) {
        return false; // Member already exists
      }

      // Create new member
      await storage.createMember({ phone, nickname });

      // Send terms and conditions
      await this.sendTermsAndConditions(phone);

      return true;
    } catch (error) {
      console.error('Error registering member from web:', error);
      return false;
    }
  }

  // Method to approve member from admin interface
  async approveMember(memberId: string): Promise<boolean> {
    try {
      const member = await storage.getMemberById(memberId);
      if (!member) {
        return false;
      }

      // Update member status to active
      await storage.updateMember(memberId, { status: 'active' });

      // Send approval notification to member
      const approvalMessage = `🎉 مبروك! تم قبولك في مجموعة ريدز

✅ تم تفعيل عضويتك بنجاح
🎥 يمكنك الآن مشاركة الفيديوهات
📊 حد أقصى 3 فيديوهات يومياً

أرسل "مساعدة" للحصول على التعليمات الكاملة`;

      await this.sendMessage(member.phone, approvalMessage);
      await this.sendInstructions(member.phone);

      await storage.createBotLog({
        type: 'member_joined',
        memberId: memberId,
        message: `Member approved and activated: ${member.phone}`,
        metadata: { approvedAt: new Date().toISOString() }
      });

      return true;
    } catch (error) {
      console.error('Error approving member:', error);
      return false;
    }
  }

  // Method to reject member from admin interface
  async rejectMember(memberId: string, reason?: string): Promise<boolean> {
    try {
      const member = await storage.getMemberById(memberId);
      if (!member) {
        return false;
      }

      // Update member status to inactive
      await storage.updateMember(memberId, { status: 'inactive' });

      // Send rejection notification to member
      const rejectionMessage = `❌ نأسف لإبلاغك بأنه لم يتم قبولك في مجموعة ريدز

${reason ? `السبب: ${reason}` : ''}

يمكنك المحاولة مرة أخرى لاحقاً بكتابة "ريدز" أو "REDZ"`;

      await this.sendMessage(member.phone, rejectionMessage);

      await storage.createBotLog({
        type: 'member_removed',
        memberId: memberId,
        message: `Member rejected: ${member.phone}`,
        metadata: { reason, rejectedAt: new Date().toISOString() }
      });

      return true;
    } catch (error) {
      console.error('Error rejecting member:', error);
      return false;
    }
  }
}

export const whatsappBot = new WhatsAppBot();
