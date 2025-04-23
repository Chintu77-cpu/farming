import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import OpenAI from "openai";
import { insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

// Log OpenAI API key status (not the actual key)
console.log("OpenAI API Key Status:", process.env.OPENAI_API_KEY ? "Set" : "Not set");

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
      
      // Helper function for fallback answers when OpenAI fails
      const getFallbackAnswer = (question: string): string => {
        const normalizedQuestion = question.toLowerCase();
        
        if (normalizedQuestion.includes("water") || normalizedQuestion.includes("irrigation")) {
          return "For water conservation in farming: Consider implementing drip irrigation, which can save up to 60% water compared to traditional methods. Mulching helps retain soil moisture. Leveling fields properly prevents runoff. Scheduled irrigation during early morning or evening reduces evaporation losses.";
        }
        
        if (normalizedQuestion.includes("soil") || normalizedQuestion.includes("nutrient")) {
          return "For healthy soil: Regularly test soil pH and nutrient levels. Practice crop rotation to prevent nutrient depletion. Use cover crops during off-seasons to add organic matter. Apply compost to improve soil structure. Minimize tillage to preserve beneficial soil organisms.";
        }
        
        if (normalizedQuestion.includes("pest") || normalizedQuestion.includes("insect") || normalizedQuestion.includes("disease")) {
          return "For sustainable pest management: Use companion planting to naturally repel insects. Introduce beneficial insects like ladybugs that prey on pests. Apply neem oil as a natural pesticide. Maintain biodiversity in your fields to prevent large pest outbreaks.";
        }
        
        if (normalizedQuestion.includes("paddy") || normalizedQuestion.includes("rice")) {
          return "For paddy cultivation: The System of Rice Intensification (SRI) can increase yields while using less water. Maintain shallow water levels (2-3cm) instead of deep flooding. Use young seedlings (8-12 days) when transplanting. Space plants properly to allow sunlight penetration.";
        }
        
        // Default answer for other questions
        return "I can provide information about sustainable farming practices, water conservation, soil health, and paddy cultivation. I'll share more specific advice on these farming topics based on your questions.";
      };
      
      // If it's a user message, generate AI response
      if (messageData.role === 'user') {
        try {
          // Get all previous messages for context (limit to last 10 messages for context window)
          const allMessages = await storage.getChatMessagesByUserId(messageData.userId);
          const recentMessages = allMessages.slice(-10);
          
          // Format messages for OpenAI
          const formattedMessages: Array<{ role: 'user' | 'assistant' | 'system', content: string }> = recentMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
          
          // Add system message for farming context with comprehensive paddy farming knowledge
          formattedMessages.unshift({
            role: 'system',
            content: `You are a farming assistant specializing in sustainable agriculture, paddy cultivation, water conservation, and soil health. Provide helpful, accurate information about farming practices. Give concise, practical advice that farmers can implement.

Focus especially on paddy/rice cultivation with detailed knowledge about:
1. Soil preparation: Field clearing, plowing (2-3 times, 15-20cm depth), laser leveling, bund repair, applying farmyard manure (5-10 tons/hectare).
2. Water management: Maintaining 2-3cm water levels, alternate wetting and drying (AWD) techniques, water tubes for monitoring, proper field drainage before harvest.
3. Planting: SRI method benefits, transplanting young seedlings (8-12 days), proper spacing (25x25cm), direct seeding techniques.
4. Fertilization: NPK application (120:60:60 kg/ha in split doses), organic alternatives, timing for different growth stages.
5. Pest management: Using resistant varieties, crop rotation, field sanitation, natural enemies, specific controls for stem borers, blast disease, and bacterial leaf blight.
6. Weed management: Clean fields, water level management, mechanical weeding (10-15 and 25-30 days after transplanting), stale seedbed techniques.
7. Harvesting: Timing (80-85% golden yellow grains), draining fields 7-10 days before, harvesting tools, proper grain moisture (14%), threshing techniques.
8. Post-harvest: Cleaning, drying, proper storage in ventilated spaces, using jute bags with polythene liners, hermetic bags for long-term storage.

Always provide detailed, step-by-step advice with specific measurements, timing, and techniques. Prioritize sustainable and eco-friendly farming practices.`
          });

          console.log('Sending chat request to OpenAI with messages:', 
            formattedMessages.map(m => ({ role: m.role, contentLength: m.content.length }))
          );

          // Call OpenAI API
          const completion = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 500,
          });

          console.log('Received response from OpenAI');

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
          
          // Create a fallback response
          const fallbackAnswer = getFallbackAnswer(messageData.content);
          const aiMessage = await storage.createChatMessage({
            userId: messageData.userId,
            role: 'assistant',
            content: fallbackAnswer
          });
          
          return res.status(201).json({
            userMessage: savedMessage,
            aiResponse: aiMessage,
            error: "Used fallback response due to API error"
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
