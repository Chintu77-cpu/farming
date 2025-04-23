import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  displayName: text("display_name"),
  email: text("email"),
  photoURL: text("photo_url"),
  preferredLanguage: text("preferred_language").default("en"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  data: jsonb("data").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const soilData = pgTable("soil_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  location: text("location").notNull(),
  moistureLevel: integer("moisture_level").notNull(),
  status: text("status").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const waterTips = pgTable("water_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
});

export const paddyInfo = pgTable("paddy_info", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({ id: true, lastUpdated: true });
export const insertSoilDataSchema = createInsertSchema(soilData).omit({ id: true, lastUpdated: true });
export const insertWaterTipSchema = createInsertSchema(waterTips).omit({ id: true });
export const insertPaddyInfoSchema = createInsertSchema(paddyInfo).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;

export type InsertSoilData = z.infer<typeof insertSoilDataSchema>;
export type SoilData = typeof soilData.$inferSelect;

export type InsertWaterTip = z.infer<typeof insertWaterTipSchema>;
export type WaterTip = typeof waterTips.$inferSelect;

export type InsertPaddyInfo = z.infer<typeof insertPaddyInfoSchema>;
export type PaddyInfo = typeof paddyInfo.$inferSelect;
