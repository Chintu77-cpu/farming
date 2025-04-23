import { useTranslation } from "react-i18next";
import WeatherCard from "./WeatherCard";
import WaterConservationCard from "./WaterConservationCard";
import SoilHealthCard from "./SoilHealthCard";
import PaddyGuideCard from "./PaddyGuideCard";

const FeatureGrid = () => {
  const { t } = useTranslation();

  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-secondary-dark mb-6 text-center">
        {t("features.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WeatherCard />
        <WaterConservationCard />
        <SoilHealthCard />
        <PaddyGuideCard />
      </div>
    </section>
  );
};

export default FeatureGrid;
