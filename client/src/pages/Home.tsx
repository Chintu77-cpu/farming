import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import ChatbotAssistant from "@/components/ChatbotAssistant";
import FeaturedContent from "@/components/FeaturedContent";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

const Home = () => {
  const chatbotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Get weather data
  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeatherData(data))
      .catch(err => console.error('Failed to fetch weather data:', err));
  }, []);

  const scrollToChatbot = () => {
    if (chatbotRef.current) {
      chatbotRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      toast({
        title: "Can't find chatbot section",
        description: "Please scroll down to use the AI Assistant.",
        variant: "default",
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section with Updated Design */}
      <HeroSection scrollToChatbot={scrollToChatbot} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Weather Widget */}
        {weatherData && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 bg-gradient-to-r from-sky-100 to-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {weatherData.location.name}, {weatherData.location.region}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(weatherData.location.localtime).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <img 
                  src={weatherData.current.condition.icon} 
                  alt={weatherData.current.condition.text}
                  className="w-16 h-16 mx-auto"
                />
                <p className="text-sm font-medium">{weatherData.current.condition.text}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{weatherData.current.temp_c}°C</div>
                <div className="text-sm text-gray-600">
                  Feels like: {weatherData.current.feelslike_c}°C
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                <div><span className="font-medium">Humidity:</span> {weatherData.current.humidity}%</div>
                <div><span className="font-medium">Wind:</span> {weatherData.current.wind_kph} km/h</div>
              </div>
              <div className="text-sm">
                <div><span className="font-medium">Precipitation:</span> {weatherData.current.precip_mm} mm</div>
                <div><span className="font-medium">Cloud:</span> {weatherData.current.cloud}%</div>
              </div>
              {user && (
                <Button 
                  variant="outline" 
                  className="text-sm bg-white hover:bg-primary hover:text-white transition-colors"
                >
                  {t("weather.viewDetails")}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Feature Grid with Farming Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {t("home.featuredTips")}
          </h2>
          <FeatureGrid />
        </div>
        
        {/* AI Chatbot Assistant */}
        <ChatbotAssistant ref={chatbotRef} />
        
        {/* Featured Content Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {t("home.learnMore")}
          </h2>
          <FeaturedContent />
        </div>
      </main>
    </div>
  );
};

export default Home;
