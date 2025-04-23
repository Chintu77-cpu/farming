import { 
  users, chatMessages, weatherData, soilData, waterTips, paddyInfo,
  type User, type InsertUser, 
  type ChatMessage, type InsertChatMessage,
  type WeatherData, type InsertWeatherData,
  type SoilData, type InsertSoilData,
  type WaterTip, type InsertWaterTip,
  type PaddyInfo, type InsertPaddyInfo
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLanguage(id: number, language: string): Promise<User | undefined>;

  // Chat operations
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Weather operations
  getWeatherData(location: string): Promise<WeatherData | undefined>;
  createOrUpdateWeatherData(data: InsertWeatherData): Promise<WeatherData>;

  // Soil operations
  getSoilDataByUserId(userId: number): Promise<SoilData | undefined>;
  createOrUpdateSoilData(data: InsertSoilData): Promise<SoilData>;

  // Water conservation tips
  getAllWaterTips(): Promise<WaterTip[]>;
  getWaterTip(id: number): Promise<WaterTip | undefined>;
  createWaterTip(tip: InsertWaterTip): Promise<WaterTip>;

  // Paddy information
  getAllPaddyInfo(): Promise<PaddyInfo[]>;
  getPaddyInfoByCategory(category: string): Promise<PaddyInfo[]>;
  getPaddyInfo(id: number): Promise<PaddyInfo | undefined>;
  createPaddyInfo(info: InsertPaddyInfo): Promise<PaddyInfo>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<number, ChatMessage>;
  private weatherData: Map<string, WeatherData>;
  private soilData: Map<number, SoilData>;
  private waterTips: Map<number, WaterTip>;
  private paddyInfo: Map<number, PaddyInfo>;
  
  currentUserId: number;
  currentChatMessageId: number;
  currentWeatherId: number;
  currentSoilId: number;
  currentWaterTipId: number;
  currentPaddyInfoId: number;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.weatherData = new Map();
    this.soilData = new Map();
    this.waterTips = new Map();
    this.paddyInfo = new Map();
    
    this.currentUserId = 1;
    this.currentChatMessageId = 1;
    this.currentWeatherId = 1;
    this.currentSoilId = 1;
    this.currentWaterTipId = 1;
    this.currentPaddyInfoId = 1;

    // Initialize with some sample data
    this.seedWaterTips();
    this.seedPaddyInfo();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserLanguage(id: number, language: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, preferredLanguage: language };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Chat operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Weather operations
  async getWeatherData(location: string): Promise<WeatherData | undefined> {
    return this.weatherData.get(location);
  }

  async createOrUpdateWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const existingData = this.weatherData.get(insertData.location);
    
    if (existingData) {
      const updatedData: WeatherData = {
        ...existingData,
        data: insertData.data,
        lastUpdated: new Date()
      };
      this.weatherData.set(insertData.location, updatedData);
      return updatedData;
    } else {
      const id = this.currentWeatherId++;
      const newData: WeatherData = {
        ...insertData,
        id,
        lastUpdated: new Date()
      };
      this.weatherData.set(insertData.location, newData);
      return newData;
    }
  }

  // Soil operations
  async getSoilDataByUserId(userId: number): Promise<SoilData | undefined> {
    return Array.from(this.soilData.values())
      .find(data => data.userId === userId);
  }

  async createOrUpdateSoilData(insertData: InsertSoilData): Promise<SoilData> {
    const existingData = Array.from(this.soilData.values())
      .find(data => data.userId === insertData.userId);
    
    if (existingData) {
      const updatedData: SoilData = {
        ...existingData,
        moistureLevel: insertData.moistureLevel,
        status: insertData.status,
        lastUpdated: new Date()
      };
      this.soilData.set(existingData.id, updatedData);
      return updatedData;
    } else {
      const id = this.currentSoilId++;
      const newData: SoilData = {
        ...insertData,
        id,
        lastUpdated: new Date()
      };
      this.soilData.set(id, newData);
      return newData;
    }
  }

  // Water conservation tips
  async getAllWaterTips(): Promise<WaterTip[]> {
    return Array.from(this.waterTips.values());
  }

  async getWaterTip(id: number): Promise<WaterTip | undefined> {
    return this.waterTips.get(id);
  }

  async createWaterTip(insertTip: InsertWaterTip): Promise<WaterTip> {
    const id = this.currentWaterTipId++;
    const tip: WaterTip = { ...insertTip, id };
    this.waterTips.set(id, tip);
    return tip;
  }

  // Paddy information
  async getAllPaddyInfo(): Promise<PaddyInfo[]> {
    return Array.from(this.paddyInfo.values());
  }

  async getPaddyInfoByCategory(category: string): Promise<PaddyInfo[]> {
    return Array.from(this.paddyInfo.values())
      .filter(info => info.category === category);
  }

  async getPaddyInfo(id: number): Promise<PaddyInfo | undefined> {
    return this.paddyInfo.get(id);
  }

  async createPaddyInfo(insertInfo: InsertPaddyInfo): Promise<PaddyInfo> {
    const id = this.currentPaddyInfoId++;
    const info: PaddyInfo = { ...insertInfo, id };
    this.paddyInfo.set(id, info);
    return info;
  }

  // Seed data
  private seedWaterTips() {
    const tips: InsertWaterTip[] = [
      {
        title: "Implement drip irrigation",
        content: "Implement drip irrigation to reduce water usage by up to 60% compared to traditional methods.",
        imageUrl: "https://images.unsplash.com/photo-1543581049-ba201aba0a18"
      },
      {
        title: "Rainwater harvesting",
        content: "Set up rainwater harvesting systems to collect and store rainwater for irrigation during dry periods.",
        imageUrl: "https://images.unsplash.com/photo-1543581049-ba201aba0a18"
      },
      {
        title: "Alternate Wetting and Drying",
        content: "Practice Alternate Wetting and Drying (AWD) technique in paddy fields to save water while maintaining yields.",
        imageUrl: "https://images.unsplash.com/photo-1543581049-ba201aba0a18"
      }
    ];

    tips.forEach(tip => {
      this.createWaterTip(tip);
    });
  }

  private seedPaddyInfo() {
    const paddyInfoItems: InsertPaddyInfo[] = [
      {
        title: "Soil Preparation for Paddy",
        content: "Prepare your soil by plowing and leveling to ensure even water distribution and optimal growing conditions.",
        category: "Soil Preparation",
        imageUrl: "https://images.unsplash.com/photo-1559745350-3b01aa3f450d"
      },
      {
        title: "Paddy Seeding Techniques",
        content: "Use proper spacing between seeds to allow optimal growth and nutrient absorption for higher yields.",
        category: "Seeding",
        imageUrl: "https://images.unsplash.com/photo-1559745350-3b01aa3f450d"
      },
      {
        title: "Water Management in Paddy Fields",
        content: "Maintain appropriate water levels at different growth stages to maximize yield and minimize water usage.",
        category: "Water Management",
        imageUrl: "https://images.unsplash.com/photo-1559745350-3b01aa3f450d"
      },
      {
        title: "Paddy Harvesting Best Practices",
        content: "Harvest at the right time when 80-85% of the grains have turned golden yellow for maximum yield and quality.",
        category: "Harvesting",
        imageUrl: "https://images.unsplash.com/photo-1559745350-3b01aa3f450d"
      }
    ];

    paddyInfoItems.forEach(info => {
      this.createPaddyInfo(info);
    });
  }
}

export const storage = new MemStorage();
