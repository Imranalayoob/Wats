import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  nickname: text("nickname").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  status: text("status", { enum: ["active", "warning", "suspended", "pending", "awaiting_approval", "inactive"] }).default("pending").notNull(),
  dailyVideosCount: integer("daily_videos_count").default(0).notNull(),
  lastVideoAt: timestamp("last_video_at"),
  lastInteractionAt: timestamp("last_interaction_at"),
  totalVideos: integer("total_videos").default(0).notNull(),
  totalInteractions: integer("total_interactions").default(0).notNull(),
  engagementRate: integer("engagement_rate").default(0).notNull(), // percentage
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id).notNull(),
  originalUrl: text("original_url").notNull(),
  shortUrl: text("short_url").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  sentToMembers: integer("sent_to_members").default(0).notNull(),
});

export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").references(() => members.id).notNull(),
  videoId: varchar("video_id").references(() => videos.id).notNull(),
  type: text("type", { enum: ["click", "view", "share"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Additional data like user agent, etc.
});

export const botLogs = pgTable("bot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["message_sent", "message_received", "member_joined", "member_removed", "error"] }).notNull(),
  memberId: varchar("member_id").references(() => members.id),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  joinedAt: true,
  dailyVideosCount: true,
  lastVideoAt: true,
  lastInteractionAt: true,
  totalVideos: true,
  totalInteractions: true,
  engagementRate: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  clickCount: true,
  sentToMembers: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertBotLogSchema = createInsertSchema(botLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type BotLog = typeof botLogs.$inferSelect;
export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Legacy user table for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
