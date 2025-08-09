import { 
  Member, InsertMember, Video, InsertVideo, Interaction, InsertInteraction,
  BotLog, InsertBotLog, Setting, InsertSetting, User, InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Legacy user methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Member methods
  getMember(id: string): Promise<Member | undefined>;
  getMemberById(id: string): Promise<Member | undefined>;
  getMemberByPhone(phone: string): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;
  getActiveMembers(): Promise<Member[]>;
  getMembersWithWarnings(): Promise<Member[]>;
  resetDailyVideoCounts(): Promise<void>;

  // Video methods
  getVideo(id: string): Promise<Video | undefined>;
  getVideosByMember(memberId: string): Promise<Video[]>;
  getAllVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  updateVideoClicks(id: string): Promise<void>;
  getTodayVideos(): Promise<Video[]>;
  getVideosByDateRange(startDate: Date, endDate: Date): Promise<Video[]>;

  // Interaction methods
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractionsByMember(memberId: string): Promise<Interaction[]>;
  getInteractionsByVideo(videoId: string): Promise<Interaction[]>;
  getTodayInteractions(): Promise<Interaction[]>;

  // Bot log methods
  createBotLog(log: InsertBotLog): Promise<BotLog>;
  getBotLogs(limit?: number): Promise<BotLog[]>;

  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;

  // Analytics methods
  getMemberStats(memberId: string): Promise<{
    totalVideos: number;
    totalInteractions: number;
    engagementRate: number;
    todayVideos: number;
  }>;
  getOverallStats(): Promise<{
    totalMembers: number;
    activeToday: number;
    videosToday: number;
    engagementRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private members: Map<string, Member>;
  private videos: Map<string, Video>;
  private interactions: Map<string, Interaction>;
  private botLogs: Map<string, BotLog>;
  private settings: Map<string, Setting>;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.videos = new Map();
    this.interactions = new Map();
    this.botLogs = new Map();
    this.settings = new Map();

    // Initialize default settings
    this.initializeDefaultSettings();
  }

  private async initializeDefaultSettings() {
    const defaultSettings = [
      { key: "max_daily_videos", value: 3 },
      { key: "warning_threshold_days", value: 2 },
      { key: "auto_remove_days", value: 7 },
      { key: "bot_welcome_message", value: "مرحباً بك في مجموعة ريدز! 🎥\n\nيمكنك إرسال 3 فيديوهات يومياً ويجب التفاعل مع جميع الروابط التي تستقبلها." },
      { key: "bot_instructions", value: "التعليمات:\n1. أرسل 3 فيديوهات كحد أقصى يومياً\n2. تفاعل مع جميع الروابط التي تستقبلها\n3. عدم التفاعل لمدة يومين يؤدي للتحذير\n4. عدم التفاعل لمدة أسبوع يؤدي للإزالة" }
    ];

    for (const setting of defaultSettings) {
      if (!this.settings.has(setting.key)) {
        const settingObj: Setting = {
          id: randomUUID(),
          key: setting.key,
          value: setting.value,
          updatedAt: new Date()
        };
        this.settings.set(setting.key, settingObj);
      }
    }
  }

  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Member methods
  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getMemberByPhone(phone: string): Promise<Member | undefined> {
    return Array.from(this.members.values()).find(member => member.phone === phone);
  }

  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values()).sort((a, b) => 
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = {
      ...insertMember,
      id,
      joinedAt: new Date(),
      status: insertMember.status || "pending",
      dailyVideosCount: 0,
      lastVideoAt: null,
      lastInteractionAt: null,
      totalVideos: 0,
      totalInteractions: 0,
      engagementRate: 0
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...updates };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  async getActiveMembers(): Promise<Member[]> {
    return Array.from(this.members.values()).filter(member => member.status === "active");
  }

  async getMembersWithWarnings(): Promise<Member[]> {
    return Array.from(this.members.values()).filter(member => member.status === "warning");
  }

  async resetDailyVideoCounts(): Promise<void> {
    for (const [id, member] of Array.from(this.members.entries())) {
      this.members.set(id, { ...member, dailyVideosCount: 0 });
    }
  }

  // Video methods
  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByMember(memberId: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.memberId === memberId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = {
      id,
      memberId: insertVideo.memberId,
      originalUrl: insertVideo.originalUrl,
      shortUrl: insertVideo.shortUrl,
      title: insertVideo.title || null,
      createdAt: new Date(),
      clickCount: 0,
      sentToMembers: 0
    };
    this.videos.set(id, video);

    // Update member stats
    const member = this.members.get(insertVideo.memberId);
    if (member) {
      this.members.set(member.id, {
        ...member,
        dailyVideosCount: member.dailyVideosCount + 1,
        totalVideos: member.totalVideos + 1,
        lastVideoAt: new Date()
      });
    }

    return video;
  }

  async updateVideoClicks(id: string): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      this.videos.set(id, { ...video, clickCount: video.clickCount + 1 });
    }
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (video) {
      const updatedVideo = { ...video, ...updates };
      this.videos.set(id, updatedVideo);
      return updatedVideo;
    }
    return undefined;
  }

  async getTodayVideos(): Promise<Video[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.videos.values()).filter(video => 
      new Date(video.createdAt) >= today
    );
  }

  async getVideosByDateRange(startDate: Date, endDate: Date): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => {
      const videoDate = new Date(video.createdAt);
      return videoDate >= startDate && videoDate <= endDate;
    });
  }

  // Interaction methods
  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = randomUUID();
    const interaction: Interaction = {
      id,
      type: insertInteraction.type,
      memberId: insertInteraction.memberId,
      videoId: insertInteraction.videoId,
      createdAt: new Date(),
      metadata: insertInteraction.metadata || {}
    };
    this.interactions.set(id, interaction);

    // Update member stats
    const member = this.members.get(insertInteraction.memberId);
    if (member) {
      this.members.set(member.id, {
        ...member,
        totalInteractions: member.totalInteractions + 1,
        lastInteractionAt: new Date()
      });
    }

    return interaction;
  }

  async getInteractionsByMember(memberId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(interaction => 
      interaction.memberId === memberId
    );
  }

  async getInteractionsByVideo(videoId: string): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(interaction => 
      interaction.videoId === videoId
    );
  }

  async getTodayInteractions(): Promise<Interaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.interactions.values()).filter(interaction => 
      new Date(interaction.createdAt) >= today
    );
  }

  // Bot log methods
  async createBotLog(insertLog: InsertBotLog): Promise<BotLog> {
    const id = randomUUID();
    const log: BotLog = {
      id,
      type: insertLog.type,
      message: insertLog.message,
      memberId: insertLog.memberId || null,
      createdAt: new Date(),
      metadata: insertLog.metadata || {}
    };
    this.botLogs.set(id, log);
    return log;
  }

  async getBotLogs(limit = 100): Promise<BotLog[]> {
    return Array.from(this.botLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = this.settings.get(insertSetting.key);
    if (existing) {
      const updated: Setting = {
        ...existing,
        value: insertSetting.value,
        updatedAt: new Date()
      };
      this.settings.set(insertSetting.key, updated);
      return updated;
    } else {
      const setting: Setting = {
        id: randomUUID(),
        ...insertSetting,
        updatedAt: new Date()
      };
      this.settings.set(insertSetting.key, setting);
      return setting;
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  // Analytics methods
  async getMemberStats(memberId: string): Promise<{
    totalVideos: number;
    totalInteractions: number;
    engagementRate: number;
    todayVideos: number;
  }> {
    const member = this.members.get(memberId);
    if (!member) {
      return { totalVideos: 0, totalInteractions: 0, engagementRate: 0, todayVideos: 0 };
    }

    const todayVideos = await this.getTodayVideos();
    const memberTodayVideos = todayVideos.filter(v => v.memberId === memberId).length;

    return {
      totalVideos: member.totalVideos,
      totalInteractions: member.totalInteractions,
      engagementRate: member.engagementRate,
      todayVideos: memberTodayVideos
    };
  }

  async getOverallStats(): Promise<{
    totalMembers: number;
    activeToday: number;
    videosToday: number;
    engagementRate: number;
  }> {
    const totalMembers = this.members.size;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeToday = Array.from(this.members.values()).filter(member => 
      member.lastInteractionAt && new Date(member.lastInteractionAt) >= today
    ).length;

    const videosToday = (await this.getTodayVideos()).length;
    
    const allMembers = Array.from(this.members.values());
    const avgEngagement = allMembers.length > 0 
      ? allMembers.reduce((sum, member) => sum + member.engagementRate, 0) / allMembers.length
      : 0;

    return {
      totalMembers,
      activeToday,
      videosToday,
      engagementRate: Math.round(avgEngagement)
    };
  }
}

export const storage = new MemStorage();
