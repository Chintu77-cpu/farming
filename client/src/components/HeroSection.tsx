import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface HeroSectionProps {
  scrollToChatbot: () => void;
}

const HeroSection = ({ scrollToChatbot }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative bg-secondary-dark">
      <div className="absolute inset-0 z-0 opacity-30">
        <img 
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200&h=400" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center justify-center"
              onClick={scrollToChatbot}
            >
              <i className="ri-robot-line mr-2"></i> {t("hero.askAssistant")}
            </Button>
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-100 text-primary-dark font-bold py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center justify-center"
            >
              <i className="ri-book-open-line mr-2"></i> {t("hero.browseResources")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
