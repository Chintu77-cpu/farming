import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const FarmingTips = () => {
  const { t } = useTranslation();

  const { data: paddyInfo, isLoading } = useQuery({
    queryKey: ['/api/paddy-info'],
    queryFn: async () => {
      const response = await apiRequest("get", "/api/paddy-info", undefined);
      return response.json();
    }
  });

  // Get unique categories
  const categories = paddyInfo ? 
    [...new Set(paddyInfo.map((item: any) => item.category))] : 
    [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">
          {t("paddyGuide.title")}
        </h1>
        <p className="text-gray-700 mb-8">
          {t("paddyGuide.pageDescription")}
        </p>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-md mx-auto mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue={categories[0] || "default"}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              {categories.map((category: string) => (
                <TabsTrigger key={category} value={category}>
                  {t(`paddyGuide.categories.${category.toLowerCase()}`, category)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category: string) => (
              <TabsContent key={category} value={category} className="space-y-6">
                {paddyInfo
                  .filter((item: any) => item.category === category)
                  .map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-secondary-dark mb-4">
                          {item.title}
                        </h2>
                        <p className="text-gray-700">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                }
              </TabsContent>
            ))}

            {/* Fallback if no categories are available */}
            {categories.length === 0 && (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600">{t("paddyGuide.noInformation")}</p>
              </div>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default FarmingTips;
