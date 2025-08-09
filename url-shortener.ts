import { randomBytes } from 'crypto';
import { storage } from '../storage';

interface ShortUrlData {
  originalUrl: string;
  shortCode: string;
  memberId: string;
  clicks: number;
  createdAt: Date;
}

class URLShortener {
  private urlMap: Map<string, ShortUrlData> = new Map();
  private baseUrl: string;

  constructor() {
    // Use Replit domain for production or localhost for development
    const replitDomain = process.env.REPL_SLUG && process.env.REPL_OWNER 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
      : null;
    
    this.baseUrl = process.env.BASE_URL || replitDomain || 'http://localhost:5000';
    
    console.log(`URL Shortener initialized with base URL: ${this.baseUrl}`);
  }

  async createShortUrl(originalUrl: string, memberId: string): Promise<string> {
    const shortCode = this.generateShortCode();
    
    const urlData: ShortUrlData = {
      originalUrl,
      shortCode,
      memberId,
      clicks: 0,
      createdAt: new Date()
    };

    this.urlMap.set(shortCode, urlData);

    const shortUrl = `${this.baseUrl}/s/${shortCode}`;
    
    // Log the URL creation
    await storage.createBotLog({
      type: 'message_sent',
      memberId,
      message: `Short URL created: ${shortUrl} -> ${originalUrl}`,
      metadata: { originalUrl, shortUrl, shortCode }
    });

    return shortUrl;
  }

  async getOriginalUrl(shortCode: string): Promise<{ url: string; memberId: string } | null> {
    const urlData = this.urlMap.get(shortCode);
    if (!urlData) {
      return null;
    }

    // Increment click count
    urlData.clicks++;
    
    // Create interaction record
    await storage.createInteraction({
      memberId: urlData.memberId,
      videoId: shortCode, // Using shortCode as temporary video ID
      type: 'click',
      metadata: {
        clickedAt: new Date().toISOString(),
        userAgent: 'unknown' // Will be populated from request headers
      }
    });

    return {
      url: urlData.originalUrl,
      memberId: urlData.memberId
    };
  }

  async getClickStats(shortCode: string): Promise<ShortUrlData | null> {
    return this.urlMap.get(shortCode) || null;
  }

  async getAllUrls(): Promise<ShortUrlData[]> {
    return Array.from(this.urlMap.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  private generateShortCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomByte = randomBytes(1)[0];
      result += chars[randomByte % chars.length];
    }
    
    // Ensure uniqueness
    if (this.urlMap.has(result)) {
      return this.generateShortCode(length);
    }
    
    return result;
  }

  // Clean up old URLs (optional maintenance function)
  cleanupOldUrls(olderThanDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deleted = 0;
    for (const [shortCode, urlData] of Array.from(this.urlMap.entries())) {
      if (urlData.createdAt < cutoffDate) {
        this.urlMap.delete(shortCode);
        deleted++;
      }
    }
    
    return deleted;
  }
}

export const urlShortener = new URLShortener();
