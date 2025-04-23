import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData, getWeatherMessage, getRainForecast } from "@/lib/weatherapi";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const WeatherCard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['/api/weather'],
    queryFn: async () => await getWeatherData(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    onError: () => {
      toast({
        title: t("weather.errorTitle"),
        description: t("weather.errorMessage"),
        variant: "destructive",
      });
    }
  });

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="bg-accent-light text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{t("weather.title")}</h3>
            <i className="ri-sun-line text-2xl"></i>
          </div>
        </div>
        <div className="p-4">
          <p className="text-center text-red-500">{t("weather.unavailable")}</p>
          <Button className="w-full mt-4" onClick={() => window.location.reload()}>
            {t("weather.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-accent-light text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{t("weather.title")}</h3>
          <i className="ri-sun-line text-2xl"></i>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <div>
                <Skeleton className="h-9 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <Skeleton className="h-3 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-3 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-3 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {weatherData?.current.temp_c}°C
                </p>
                <p className="text-sm text-gray-600">
                  {weatherData?.current.condition.text}
                </p>
              </div>
              <img 
                src={weatherData?.current.condition.icon} 
                alt="Weather icon" 
                className="w-16 h-16"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("weather.humidity")}</p>
                <p className="font-semibold text-sm">{weatherData?.current.humidity}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("weather.wind")}</p>
                <p className="font-semibold text-sm">{weatherData?.current.wind_kph} km/h</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("weather.rain")}</p>
                <p className="font-semibold text-sm">
                  {weatherData?.forecast ? getRainForecast(weatherData.forecast) : 0}%
                </p>
              </div>
            </div>
          </>
        )}
        <div className="text-center">
          <Link href="/weather">
            <a className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
              {t("weather.viewForecast")} <i className="ri-arrow-right-line"></i>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
