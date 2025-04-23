import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData, getWeatherMessage, getRainForecast, type WeatherData } from "@/lib/weatherapi";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Weather = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<string>("auto:ip");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: weatherData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: async () => await getWeatherData(location),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setLocation(searchTerm.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format date from API
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Format time from API
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">
          {t("weather.pageTitle")}
        </h1>
        <p className="text-gray-700 mb-8">
          {t("weather.pageDescription")}
        </p>

        {/* Location search */}
        <div className="flex space-x-2 mb-8">
          <Input
            placeholder={t("weather.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white border-gray-300"
          />
          <Button onClick={handleSearch}>
            {t("weather.search")}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : error ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <i className="ri-cloud-off-line text-5xl text-gray-400 mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("weather.errorTitle")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("weather.errorMessage")}
                </p>
                <Button onClick={() => refetch()}>
                  {t("weather.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current weather */}
            <Card className="mb-8 overflow-hidden">
              <div className="bg-accent p-6 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">
                      {weatherData?.location.name}, {weatherData?.location.region}
                    </h2>
                    <p className="text-white/90">
                      {weatherData?.location.country} • {new Date(weatherData?.location.localtime || "").toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center mt-4 sm:mt-0">
                    <img 
                      src={weatherData?.current.condition.icon} 
                      alt={weatherData?.current.condition.text} 
                      className="w-16 h-16 mr-2"
                    />
                    <div className="text-center">
                      <p className="text-4xl font-bold">{weatherData?.current.temp_c}°C</p>
                      <p>{weatherData?.current.condition.text}</p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3">
                    <i className="ri-drop-line text-2xl text-accent mb-2"></i>
                    <p className="text-sm text-gray-500">{t("weather.humidity")}</p>
                    <p className="text-lg font-semibold">{weatherData?.current.humidity}%</p>
                  </div>
                  <div className="text-center p-3">
                    <i className="ri-windy-line text-2xl text-accent mb-2"></i>
                    <p className="text-sm text-gray-500">{t("weather.wind")}</p>
                    <p className="text-lg font-semibold">{weatherData?.current.wind_kph} km/h</p>
                  </div>
                  <div className="text-center p-3">
                    <i className="ri-showers-line text-2xl text-accent mb-2"></i>
                    <p className="text-sm text-gray-500">{t("weather.rain")}</p>
                    <p className="text-lg font-semibold">
                      {weatherData?.forecast ? getRainForecast(weatherData.forecast) : 0}%
                    </p>
                  </div>
                  <div className="text-center p-3">
                    <i className="ri-temp-hot-line text-2xl text-accent mb-2"></i>
                    <p className="text-sm text-gray-500">{t("weather.feelsLike")}</p>
                    <p className="text-lg font-semibold">{weatherData?.current.feelslike_c}°C</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <i className="ri-information-line text-accent mt-1 mr-3 text-lg"></i>
                    <p className="text-gray-700">
                      {weatherData ? getWeatherMessage(weatherData.current.condition.text, weatherData.current.temp_c) : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forecast */}
            <h2 className="text-2xl font-semibold text-secondary-dark mb-4">
              {t("weather.forecast")}
            </h2>
            
            {weatherData?.forecast?.forecastday && (
              <Tabs defaultValue="daily">
                <TabsList className="mb-6">
                  <TabsTrigger value="daily">{t("weather.dailyForecast")}</TabsTrigger>
                  <TabsTrigger value="hourly">{t("weather.hourlyForecast")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="daily">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weatherData.forecast.forecastday.map((day: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">
                              {index === 0 ? t("weather.today") : formatDate(day.date)}
                            </h3>
                            <img 
                              src={day.day.condition.icon} 
                              alt={day.day.condition.text} 
                              className="w-12 h-12"
                            />
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">{t("weather.maxTemp")}</span>
                            <span className="font-semibold">{day.day.maxtemp_c}°C</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">{t("weather.minTemp")}</span>
                            <span className="font-semibold">{day.day.mintemp_c}°C</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500">{t("weather.condition")}</span>
                            <span className="font-semibold">{day.day.condition.text}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t("weather.chanceOfRain")}</span>
                            <span className="font-semibold">{day.day.daily_chance_of_rain}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="hourly">
                  <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-4 min-w-max">
                      {weatherData.forecast.forecastday[0].hour
                        .filter((_: any, i: number) => i % 3 === 0) // Show every 3 hours
                        .map((hour: any, index: number) => (
                          <Card key={index} className="w-36">
                            <CardContent className="p-3 text-center">
                              <p className="text-sm font-medium mb-2">{formatTime(hour.time)}</p>
                              <img 
                                src={hour.condition.icon} 
                                alt={hour.condition.text} 
                                className="w-12 h-12 mx-auto mb-2"
                              />
                              <p className="text-lg font-semibold mb-1">{hour.temp_c}°C</p>
                              <p className="text-xs text-gray-500">{hour.condition.text}</p>
                              <div className="mt-2 flex justify-between text-xs">
                                <span className="flex items-center">
                                  <i className="ri-drop-line mr-1 text-accent"></i> {hour.chance_of_rain}%
                                </span>
                                <span className="flex items-center">
                                  <i className="ri-windy-line mr-1 text-accent"></i> {hour.wind_kph} km/h
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
