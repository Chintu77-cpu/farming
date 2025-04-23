import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import OpenAI from "openai";
import { insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/auth/user', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUid(userData.uid);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      // Create new user
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.patch('/api/users/:id/language', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { language } = req.body;
      
      if (!language || !['en', 'hi', 'te'].includes(language)) {
        return res.status(400).json({ message: "Invalid language" });
      }
      
      const updatedUser = await storage.updateUserLanguage(userId, language);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update language preference" });
    }
  });

  // Chat message routes
  app.get('/api/chat/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Save user message
      const savedMessage = await storage.createChatMessage(messageData);
      
      // If it's a user message, generate AI response
      if (messageData.role === 'user') {
        try {
          // Get all previous messages for context
          const allMessages = await storage.getChatMessagesByUserId(messageData.userId);
          
          // Format messages for OpenAI
          const formattedMessages = allMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
          
          // Add system message for farming context
          formattedMessages.unshift({
            role: 'system',
            content: 'You are a farming assistant specializing in sustainable agriculture, paddy cultivation, water conservation, and soil health. Provide helpful, accurate information about farming practices.'
          });

          // Call OpenAI API
          const completion = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: formattedMessages,
          });

          // Save AI response to database
          const aiMessageContent = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
          const aiMessage = await storage.createChatMessage({
            userId: messageData.userId,
            role: 'assistant',
            content: aiMessageContent
          });

          // Return both messages
          return res.status(201).json({
            userMessage: savedMessage,
            aiResponse: aiMessage
          });
        } catch (aiError) {
          console.error("OpenAI error:", aiError);
          return res.status(201).json({
            userMessage: savedMessage,
            error: "Failed to generate AI response"
          });
        }
      }
      
      res.status(201).json(savedMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save message" });
      }
    }
  });

  // Weather API route
  app.get('/api/weather', async (req: Request, res: Response) => {
    try {
      const { location = 'auto:ip' } = req.query;
      
      // Check if we have recent weather data in storage
      const cachedData = await storage.getWeatherData(location as string);
      const now = new Date();
      
      // If we have data that's less than 30 minutes old, return it
      if (cachedData && cachedData.lastUpdated && 
          (now.getTime() - new Date(cachedData.lastUpdated).getTime()) < 30 * 60 * 1000) {
        return res.json(cachedData.data);
      }
      
      // Otherwise fetch new data
      const weatherApiKey = process.env.WEATHER_API_KEY || '';
      const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${location}&days=3&aqi=no&alerts=no`;
      
      const response = await axios.get(weatherApiUrl);
      const weatherData = response.data;
      
      // Cache the data
      await storage.createOrUpdateWeatherData({
        location: location as string,
        data: weatherData
      });
      
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Soil data routes
  app.get('/api/soil/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const soilData = await storage.getSoilDataByUserId(userId);
      
      if (!soilData) {
        // Default data for new users
        return res.json({
          userId,
          location: "Default Location",
          moistureLevel: 70,
          status: "Optimal"
        });
      }
      
      res.json(soilData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch soil data" });
    }
  });

  app.post('/api/soil', async (req: Request, res: Response) => {
    try {
      const { userId, location, moistureLevel } = req.body;
      
      if (!userId || !location || moistureLevel === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Determine soil status based on moisture level
      let status = "Unknown";
      if (moistureLevel < 30) status = "Dry";
      else if (moistureLevel < 60) status = "Moderate";
      else if (moistureLevel <= 80) status = "Optimal";
      else status = "Wet";
      
      const soilData = await storage.createOrUpdateSoilData({
        userId,
        location,
        moistureLevel,
        status
      });
      
      res.status(201).json(soilData);
    } catch (error) {
      res.status(500).json({ message: "Failed to save soil data" });
    }
  });

  // Water conservation tips routes
  app.get('/api/water-tips', async (req: Request, res: Response) => {
    try {
      const tips = await storage.getAllWaterTips();
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch water conservation tips" });
    }
  });

  app.get('/api/water-tips/:id', async (req: Request, res: Response) => {
    try {
      const tipId = parseInt(req.params.id);
      const tip = await storage.getWaterTip(tipId);
      
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      
      res.json(tip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch water conservation tip" });
    }
  });

  // Paddy information routes
  app.get('/api/paddy-info', async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      
      if (category) {
        const info = await storage.getPaddyInfoByCategory(category as string);
        return res.json(info);
      }
      
      const allInfo = await storage.getAllPaddyInfo();
      res.json(allInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paddy information" });
    }
  });

  app.get('/api/paddy-info/:id', async (req: Request, res: Response) => {
    try {
      const infoId = parseInt(req.params.id);
      const info = await storage.getPaddyInfo(infoId);
      
      if (!info) {
        return res.status(404).json({ message: "Information not found" });
      }
      
      res.json(info);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paddy information" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
