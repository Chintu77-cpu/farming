import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SoilHealth = () => {
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
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
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

  // Get status recommendations based on soil status
  const getRecommendations = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dry':
        return t("soilHealth.recommendations.dry");
      case 'moderate':
        return t("soilHealth.recommendations.moderate");
      case 'optimal':
        return t("soilHealth.recommendations.optimal");
      case 'wet':
        return t("soilHealth.recommendations.wet");
      default:
        return t("soilHealth.recommendations.unknown");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">
          {t("soilHealth.pageTitle")}
        </h1>
        <p className="text-gray-700 mb-8">
          {t("soilHealth.pageDescription")}
        </p>

        <Tabs defaultValue="moisture">
          <TabsList className="mb-8">
            <TabsTrigger value="moisture">{t("soilHealth.tabs.moisture")}</TabsTrigger>
            <TabsTrigger value="tips">{t("soilHealth.tabs.tips")}</TabsTrigger>
            <TabsTrigger value="testing">{t("soilHealth.tabs.testing")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="moisture">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full mb-6" />
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-secondary-dark mb-3">
                    {t("soilHealth.moistureStatus")}
                  </h2>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">{t("soilHealth.moistureLevel")}</span>
                      <span className={`text-sm font-medium ${getStatusColor(soilData?.status || 'optimal')}`}>
                        {getStatusText(soilData?.status || 'optimal')}
                      </span>
                    </div>
                    <Progress 
                      value={soilData?.moistureLevel || 70} 
                      className="h-3 bg-gray-200"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t("soilHealth.dry")}</span>
                      <span>{t("soilHealth.moderate")}</span>
                      <span>{t("soilHealth.optimal")}</span>
                      <span>{t("soilHealth.wet")}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-secondary-dark mb-2">
                      {t("soilHealth.recommendations.title")}
                    </h3>
                    <p className="text-gray-700">
                      {getRecommendations(soilData?.status || 'optimal')}
                    </p>
                  </div>

                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=1200&h=400" 
                      alt="Soil testing" 
                      className="w-full h-60 object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-dark mb-3">
                    {t("soilHealth.tips.title1")}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {t("soilHealth.tips.content1")}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>{t("soilHealth.tips.bullet1")}</li>
                    <li>{t("soilHealth.tips.bullet2")}</li>
                    <li>{t("soilHealth.tips.bullet3")}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-dark mb-3">
                    {t("soilHealth.tips.title2")}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {t("soilHealth.tips.content2")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-secondary-dark mb-3">
                  {t("soilHealth.testing.title")}
                </h3>
                <p className="text-gray-700 mb-4">
                  {t("soilHealth.testing.description")}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-secondary-dark mb-2">
                      {t("soilHealth.testing.professionalTitle")}
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">
                      {t("soilHealth.testing.professionalContent")}
                    </p>
                    <p className="text-primary-dark text-sm font-medium">
                      {t("soilHealth.testing.contactLab")}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-secondary-dark mb-2">
                      {t("soilHealth.testing.diyTitle")}
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">
                      {t("soilHealth.testing.diyContent")}
                    </p>
                    <p className="text-primary-dark text-sm font-medium">
                      {t("soilHealth.testing.learnMore")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SoilHealth;
