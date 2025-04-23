import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import ChatbotAssistant from "@/components/ChatbotAssistant";
import FeaturedContent from "@/components/FeaturedContent";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const chatbotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToChatbot = () => {
    if (chatbotRef.current) {
      chatbotRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      toast({
        title: "Can't find chatbot section",
        description: "Please scroll down to use the AI Assistant.",
        variant: "default",
      });
    }
  };

  return (
    <div>
      <HeroSection scrollToChatbot={scrollToChatbot} />
      <main className="container mx-auto px-4 py-8">
        <FeatureGrid />
        <ChatbotAssistant ref={chatbotRef} />
        <FeaturedContent />
      </main>
    </div>
  );
};

export default Home;
