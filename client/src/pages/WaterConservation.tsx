import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WaterConservation = () => {
  const { t } = useTranslation();

  const { data: tips, isLoading } = useQuery({
    queryKey: ['/api/water-tips'],
    queryFn: async () => {
      const response = await apiRequest("get", "/api/water-tips", undefined);
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-4">
            {t("waterConservation.pageTitle")}
          </h1>
          <p className="text-gray-700">
            {t("waterConservation.pageDescription")}
          </p>
        </div>

        <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1543581049-ba201aba0a18?auto=format&fit=crop&q=80&w=1200&h=400" 
            alt="Water conservation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="p-8 max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-3">
                {t("waterConservation.bannerTitle")}
              </h2>
              <p className="text-white/90">
                {t("waterConservation.bannerText")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-secondary-dark mb-6">
          {t("waterConservation.tipsTitle")}
        </h2>

        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          <div className="grid gap-6">
            {tips && tips.length > 0 ? (
              tips.map((tip: any) => (
                <Card key={tip.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <i className="ri-drop-line text-2xl text-primary"></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-dark mb-2">
                          {tip.title}
                        </h3>
                        <p className="text-gray-700">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600">{t("waterConservation.noTipsAvailable")}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 p-6 bg-accent/10 rounded-lg">
          <h3 className="text-xl font-semibold text-accent-dark mb-3">
            {t("waterConservation.factTitle")}
          </h3>
          <p className="text-gray-700 mb-2">
            {t("waterConservation.fact1")}
          </p>
          <p className="text-gray-700">
            {t("waterConservation.fact2")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterConservation;
