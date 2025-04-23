import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const WaterConservationCard = () => {
  const { t } = useTranslation();

  const { data: tips, isLoading } = useQuery({
    queryKey: ['/api/water-tips'],
    queryFn: async () => {
      const response = await apiRequest("get", "/api/water-tips", undefined);
      return response.json();
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 relative">
        <img 
          src="https://images.unsplash.com/photo-1543581049-ba201aba0a18?auto=format&fit=crop&q=80&w=400&h=160" 
          alt="Water conservation" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-lg p-4">
            {t("waterConservation.title")}
          </h3>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-9 w-full mt-4" />
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {tips && tips.length > 0 ? 
                tips.slice(0, 2).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <i className="ri-drop-line text-accent mt-1 mr-2"></i>
                    <p className="text-sm text-gray-700">{tip.content}</p>
                  </li>
                )) : (
                  <li className="flex items-start">
                    <i className="ri-drop-line text-accent mt-1 mr-2"></i>
                    <p className="text-sm text-gray-700">{t("waterConservation.noTips")}</p>
                  </li>
                )
              }
            </ul>
            <Link href="/water-conservation">
              <Button className="mt-3 w-full bg-background-dark hover:bg-background text-primary-dark font-medium py-2 rounded-lg transition-colors">
                {t("waterConservation.viewAll")}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default WaterConservationCard;
