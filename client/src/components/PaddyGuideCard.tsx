import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const PaddyGuideCard = () => {
  const { t } = useTranslation();

  const { data: paddyInfo, isLoading } = useQuery({
    queryKey: ['/api/paddy-info'],
    queryFn: async () => {
      const response = await apiRequest("get", "/api/paddy-info", undefined);
      return response.json();
    }
  });

  // Get unique categories from paddy info
  const categories = paddyInfo ? 
    [...new Set(paddyInfo.map(item => item.category))] : 
    [];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 relative">
        <img 
          src="https://images.unsplash.com/photo-1559745350-3b01aa3f450d?auto=format&fit=crop&q=80&w=400&h=160" 
          alt="Paddy fields" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-lg p-4">
            {t("paddyGuide.title")}
          </h3>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full mb-3" />
            <div className="flex flex-wrap gap-2 mb-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3">
              {t("paddyGuide.description")}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <span key={index} className="text-xs bg-background-dark text-secondary-dark py-1 px-2 rounded-full">
                    {t(`paddyGuide.categories.${category.toLowerCase()}`, category)}
                  </span>
                ))
              ) : (
                <>
                  <span className="text-xs bg-background-dark text-secondary-dark py-1 px-2 rounded-full">
                    {t("paddyGuide.categories.soilPreparation")}
                  </span>
                  <span className="text-xs bg-background-dark text-secondary-dark py-1 px-2 rounded-full">
                    {t("paddyGuide.categories.seeding")}
                  </span>
                  <span className="text-xs bg-background-dark text-secondary-dark py-1 px-2 rounded-full">
                    {t("paddyGuide.categories.waterManagement")}
                  </span>
                  <span className="text-xs bg-background-dark text-secondary-dark py-1 px-2 rounded-full">
                    {t("paddyGuide.categories.harvesting")}
                  </span>
                </>
              )}
            </div>
            <Link href="/farming-tips">
              <Button className="w-full bg-background-dark hover:bg-background text-primary-dark font-medium py-2 rounded-lg transition-colors">
                {t("paddyGuide.readGuide")}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaddyGuideCard;
