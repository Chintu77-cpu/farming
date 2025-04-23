import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env files
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define and export configuration
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || '',
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};

// Log configuration status (without revealing actual keys)
console.log('Configuration loaded:');
console.log('- OpenAI API Key:', config.openai.apiKey ? 'Set' : 'Not set');
console.log('- Weather API Key:', config.weather.apiKey ? 'Set' : 'Not set');
console.log('- Server environment:', config.server.env);