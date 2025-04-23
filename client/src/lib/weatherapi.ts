import { apiRequest } from "./queryClient";

// Interface for Weather data
export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    precip_mm: number;
    precip_in: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        totalrain_mm: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
}

// Function to get weather data for a location
export const getWeatherData = async (location: string = 'auto:ip'): Promise<WeatherData> => {
  try {
    const response = await apiRequest("get", `/api/weather?location=${encodeURIComponent(location)}`, undefined);
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

// Get a friendly message based on weather conditions
export const getWeatherMessage = (condition: string, temp: number): string => {
  // Rain-related conditions
  if (condition.toLowerCase().includes('rain') || 
      condition.toLowerCase().includes('drizzle') || 
      condition.toLowerCase().includes('shower')) {
    return "Rain is good for your crops! Make sure to check drainage systems.";
  }
  
  // Hot conditions
  if (temp > 35) {
    return "It's very hot today. Ensure your crops have adequate water and shade if needed.";
  }
  
  // Cold conditions
  if (temp < 10) {
    return "It's cold today. Protect sensitive crops from frost.";
  }
  
  // Sunny conditions
  if (condition.toLowerCase().includes('sunny') || 
      condition.toLowerCase().includes('clear')) {
    return "Good day for field work. Remember to stay hydrated!";
  }
  
  // Cloudy conditions
  if (condition.toLowerCase().includes('cloud') || 
      condition.toLowerCase().includes('overcast')) {
    return "Cloudy weather is good for transplanting seedlings.";
  }
  
  // Default message
  return "Check your fields regularly and monitor crop conditions.";
};

// Function to get rain forecast percentage for the next 24 hours
export const getRainForecast = (forecast: WeatherData['forecast']): number => {
  if (!forecast || !forecast.forecastday || forecast.forecastday.length === 0) {
    return 0;
  }
  
  return forecast.forecastday[0].day.daily_chance_of_rain;
};
