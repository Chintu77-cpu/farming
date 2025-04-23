import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { Link } from "wouter";

const SoilHealthCard = () => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID from Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get user from our database
          const response = await apiRequest("get", `/api/users/${user.uid}`, undefined);
          const userData = await response.json();
          if (userData && userData.id) {
            setUserId(userData.id);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const { data: soilData, isLoading } = useQuery({
    queryKey: ['/api/soil', userId],
    queryFn: async () => {
      if (!userId) {
        // Return default data if no user is logged in
        return {
          moistureLevel: 70,
          status: t("soilHealth.optimal")
        };
      }
      const response = await apiRequest("get", `/api/soil/${userId}`, undefined);
      return response.json();
    },
    enabled: userId !== null
  });

  // Get status text with translation
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'dry':
        return t("soilHealth.dry");
      case 'moderate':
        return t("soilHealth.moderate");
      case 'optimal':
        return t("soilHealth.optimal");
      case 'wet':
        return t("soilHealth.wet");
      default:
        return t("soilHealth.unknown");
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'dry':
        return 'text-orange-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'optimal':
        return 'text-primary-dark';
      case 'wet':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 relative">
        <img 
          src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=400&h=160" 
          alt="Soil testing" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-lg p-4">
            {t("soilHealth.title")}
          </h3>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <>
            <div className="mb-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-700">{t("soilHealth.moistureLevel")}</span>
                <span className={`text-xs font-medium ${getStatusColor(soilData?.status || 'optimal')}`}>
                  {getStatusText(soilData?.status || 'optimal')}
                </span>
              </div>
              <Progress value={soilData?.moistureLevel || 70} className="h-2 bg-gray-200" />
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {t("soilHealth.moistureMessage")}
            </p>
            <Link href="/soil-health">
              <Button className="w-full bg-background-dark hover:bg-background text-primary-dark font-medium py-2 rounded-lg transition-colors">
                {t("soilHealth.analysis")}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default SoilHealthCard;
