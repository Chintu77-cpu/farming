import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage, textToSpeech, speechToText } from "@/lib/openai";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { forwardRef } from "react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotAssistantProps {
  ref?: React.RefObject<HTMLDivElement>;
}

const ChatbotAssistant = forwardRef<HTMLDivElement, ChatbotAssistantProps>((props, ref) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<{ start: () => void; stop: () => void } | null>(null);

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

  // Fetch chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest("get", `/api/chat/${userId}`, undefined);
      return response.json();
    },
    enabled: !!userId
  });

  // Update messages when chat history changes
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })));
    } else {
      // Add welcome message if no history
      setMessages([{
        role: 'assistant',
        content: userId 
          ? t("chatbot.welcome") 
          : t("chatbot.welcome") + " " + t("chatbot.noLoginMessage")
      }]);
    }
  }, [chatHistory, t, userId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) {
        throw new Error("No user ID available");
      }
      return sendChatMessage(userId, content);
    },
    onSuccess: (data) => {
      if (data.aiResponse) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: data.userMessage.content },
          { role: 'assistant', content: data.aiResponse.content }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: data.userMessage.content }
        ]);
        // Show error if AI response failed
        if (data.error) {
          toast({
            title: t("chatbot.errorTitle"),
            description: t("chatbot.errorDescription"),
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: t("chatbot.errorTitle"),
        description: t("chatbot.errorDescription"),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Offline answers for common farming questions
  const getOfflineAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase();
    
    // Common farming questions and pre-defined answers
    if (normalizedQuestion.includes("water conservation") || normalizedQuestion.includes("save water")) {
      return "Here are some water conservation tips for farming: 1) Implement drip irrigation which can save up to 60% water compared to flood irrigation. 2) Practice mulching to reduce evaporation. 3) Consider rainwater harvesting. 4) Level your fields properly to prevent water runoff. 5) Schedule irrigation early morning or evening to reduce evaporation.";
    }
    
    if (normalizedQuestion.includes("soil health") || normalizedQuestion.includes("improve soil")) {
      return "To improve soil health: 1) Practice crop rotation to prevent nutrient depletion. 2) Use cover crops during off-seasons. 3) Add organic matter through compost. 4) Minimize tillage to preserve soil structure. 5) Test your soil regularly to monitor pH and nutrient levels.";
    }
    
    if (normalizedQuestion.includes("pest") || normalizedQuestion.includes("insect control")) {
      return "For sustainable pest management: 1) Use companion planting to repel insects naturally. 2) Introduce beneficial insects like ladybugs. 3) Apply neem oil as a natural pesticide. 4) Maintain crop diversity to prevent pest outbreaks. 5) Use row covers for physical protection of plants.";
    }
    
    // Comprehensive paddy cultivation answers
    if (normalizedQuestion.includes("paddy") || normalizedQuestion.includes("rice")) {
      // General paddy cultivation
      if (normalizedQuestion.includes("cultivat") || normalizedQuestion.includes("grow")) {
        return "For optimal paddy cultivation: 1) Choose appropriate varieties for your climate and soil type. 2) Prepare soil properly with good leveling and 2-3 plowings. 3) Use the System of Rice Intensification (SRI) for higher yields with less water. 4) Maintain 2-3 cm water level instead of deep flooding. 5) Transplant young seedlings at 8-12 days for better root development. 6) Practice proper spacing (25×25 cm) for better sunlight penetration and air circulation. 7) Apply balanced fertilization based on soil test results. 8) Monitor and control pests and diseases regularly.";
      }
      
      // Paddy harvesting
      if (normalizedQuestion.includes("harvest")) {
        return "For paddy harvesting: 1) Harvest when 80-85% of grains turn golden yellow (typically 30-45 days after flowering). 2) Drain water from fields 7-10 days before harvesting to facilitate the process. 3) Use appropriate tools (sickle, reaper, or combine harvester) based on your farm size. 4) When using manual methods, cut the crop close to the ground. 5) Thresh immediately after harvesting to prevent grain loss. 6) Dry the grains properly to 14% moisture content for safe storage. 7) Clean the grains to remove impurities before storage. 8) Store in clean, dry, and well-ventilated spaces to prevent pest infestation.";
      }
      
      // Soil preparation for paddy
      if (normalizedQuestion.includes("soil") || normalizedQuestion.includes("land") || normalizedQuestion.includes("prepare")) {
        return "For soil preparation in paddy cultivation: 1) Clear the field of previous crop residues. 2) Plow the field 2-3 times to a depth of 15-20 cm. 3) Level the field properly using a laser leveler for uniform water distribution. 4) Repair bunds to prevent water seepage. 5) Apply well-decomposed farmyard manure (5-10 tons/hectare) during final plowing. 6) For acidic soils, apply lime 2-3 weeks before planting. 7) Create proper drainage channels. 8) In SRI method, prepare raised beds with channels in between for better water management.";
      }
      
      // Water management for paddy
      if (normalizedQuestion.includes("water") || normalizedQuestion.includes("irrigat")) {
        return "For water management in paddy cultivation: 1) Maintain 2-3 cm water level during early growth stages instead of deep flooding. 2) Practice alternate wetting and drying (AWD) method to save 15-30% water. 3) Install simple water tubes (made from PVC pipes with holes) to monitor water levels below the soil surface. 4) Irrigate when water level falls 15 cm below soil surface in AWD method. 5) Maintain proper field channels and bunds to prevent water loss. 6) Drain fields completely 7-10 days before harvesting. 7) Consider direct seeded rice in water-scarce regions. 8) If available, use drip irrigation for significant water savings.";
      }
      
      // Pest and disease management for paddy
      if (normalizedQuestion.includes("pest") || normalizedQuestion.includes("disease") || normalizedQuestion.includes("insect")) {
        return "For pest and disease management in paddy: 1) Practice crop rotation to break pest cycles. 2) Use resistant varieties suited to your region. 3) Maintain field sanitation by removing crop residues that harbor pests. 4) Set up yellow sticky traps and pheromone traps for monitoring. 5) Encourage natural enemies by avoiding broad-spectrum pesticides. 6) For stem borers, apply neem-based products or release Trichogramma parasitoids. 7) For blast disease, maintain proper spacing and avoid excess nitrogen. 8) For bacterial leaf blight, use balanced fertilization and avoid field-to-field irrigation water movement.";
      }
      
      // Fertilizer application for paddy
      if (normalizedQuestion.includes("fertiliz") || normalizedQuestion.includes("nutrient") || normalizedQuestion.includes("manure")) {
        return "For paddy fertilization: 1) Always base application on soil test results. 2) Apply well-decomposed farmyard manure (5-10 tons/hectare) during land preparation. 3) For conventional cultivation, apply NPK at 120:60:60 kg/ha in split doses. 4) Apply 25% nitrogen, full phosphorus, and 50% potassium as basal dose. 5) Apply 50% nitrogen in two equal splits at tillering and panicle initiation stages. 6) Apply remaining potassium at panicle initiation. 7) Use organic fertilizers like vermicompost and neem cake for sustainable farming. 8) Consider green manuring with legumes like Sesbania or Crotalaria before rice planting.";
      }
      
      // Weed management for paddy
      if (normalizedQuestion.includes("weed")) {
        return "For weed management in paddy fields: 1) Start with clean, weed-free fields through proper land preparation. 2) Use certified clean seeds to prevent weed seed introduction. 3) In transplanted rice, maintain standing water of 2-3 cm to suppress weeds. 4) Implement mechanical weeding at 10-15 days and 25-30 days after transplanting. 5) Use cono-weeders or rotary weeders in SRI method, which also incorporates weeds as green manure. 6) If using herbicides, apply pre-emergence herbicides within 3 days of transplanting. 7) For direct-seeded rice, use stale seedbed technique by irrigating fields 10-15 days before sowing to germinate weed seeds and destroy them. 8) Practice crop rotation with non-rice crops to break weed cycles.";
      }
      
      // Post-harvest processing for paddy
      if (normalizedQuestion.includes("post-harvest") || normalizedQuestion.includes("storage") || normalizedQuestion.includes("processing")) {
        return "For post-harvest handling of paddy: 1) Thresh immediately after harvesting to prevent grain discoloration and loss. 2) Clean grains properly to remove impurities. 3) Dry grains in thin layers under sun until moisture content reaches 12-14%. 4) Use mechanical dryers during rainy seasons. 5) Store in clean, dry, and well-ventilated rooms or proper storage structures. 6) Use jute bags lined with polythene for short-term storage. 7) For long-term storage, use hermetic bags or metal silos. 8) Regularly monitor stored grains for pest infestation, and use neem leaves or diatomaceous earth as natural protectants.";
      }
      
      // Default paddy information
      return "For paddy cultivation: 1) Prepare soil properly with good leveling and 2-3 plowings. 2) Use the System of Rice Intensification (SRI) for higher yields with less water. 3) Maintain 2-3 cm water level instead of deep flooding. 4) Apply well-decomposed farmyard manure (5-10 tons/hectare) during land preparation. 5) Transplant young seedlings at 8-12 days for better growth. 6) Harvest when 80-85% of grains turn golden yellow. 7) Dry the grains properly to 14% moisture content for safe storage. 8) Practice crop rotation and integrated pest management for sustainable production.";
    }
    
    // Default response for other questions
    return "I can provide information about sustainable farming, water conservation, soil health, and paddy cultivation. Please ask specific questions about these topics, and I'll do my best to help you. For more detailed and personalized assistance, signing in will give you access to the full AI capabilities.";
  };

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    
    // Store the current message before clearing the input
    const currentMessage = message;
    setMessage("");
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      { role: 'user', content: currentMessage }
    ]);
    
    // If user is not logged in, provide offline response
    if (!userId) {
      // Simulate response delay
      setTimeout(() => {
        const offlineResponse = getOfflineAnswer(currentMessage);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: offlineResponse }
        ]);
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    // If user is logged in, use the API
    sendMessageMutation.mutate(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: t("speechToText.unsupported"),
        description: t("speechToText.browserUnsupported"),
        variant: "destructive",
      });
      return;
    }
    
    setIsListening(true);
    
    // Get the language code for speech recognition
    let langCode = "en-US";
    switch (i18n.language) {
      case "hi":
        langCode = "hi-IN";
        break;
      case "te":
        langCode = "te-IN";
        break;
    }
    
    recognition.current = speechToText(
      (text) => setMessage(text),
      () => setIsListening(false),
      langCode
    );
    
    recognition.current.start();
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const handleTextToSpeech = () => {
    if (messages.length === 0) return;
    
    // Get the last assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'assistant');
    
    if (lastAssistantMessage) {
      textToSpeech(lastAssistantMessage.content, i18n.language);
    }
  };

  return (
    <section ref={ref} className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="bg-primary text-white p-4">
        <div className="flex items-center">
          <i className="ri-robot-line text-2xl mr-2"></i>
          <h2 className="text-xl font-semibold">{t("chatbot.title")}</h2>
        </div>
        <p className="text-sm text-white/80 mt-1">{t("chatbot.subtitle")}</p>
      </div>
      
      <div className="p-4 h-80 overflow-y-auto" ref={chatMessagesRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white mr-2">
                <i className="ri-robot-line"></i>
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-accent-light text-white chatbot-message-user' 
                : 'bg-background-dark text-gray-800 chatbot-message-bot'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white mr-2">
              <i className="ri-robot-line"></i>
            </div>
            <div className="bg-background-dark p-3 rounded-lg chatbot-message-bot">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-light rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary-light rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-primary-light rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Button 
            id="voiceInputBtn" 
            className={`${isListening ? 'text-red-500' : 'text-gray-500'} hover:text-primary-dark`}
            variant="ghost"
            size="icon"
            onClick={isListening ? stopListening : startListening}
            title={isListening ? t("speechToText.stopListening") : t("speechToText.startListening")}
          >
            <i className={`${isListening ? 'ri-mic-fill' : 'ri-mic-line'} text-xl`}></i>
          </Button>
          <Input
            id="chatInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chatbot.inputPlaceholder")}
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <Button 
            id="textToSpeechBtn" 
            className="text-gray-500 hover:text-primary-dark"
            variant="ghost"
            size="icon"
            onClick={handleTextToSpeech}
            title={t("textToSpeech.speak")}
          >
            <i className="ri-volume-up-line text-xl"></i>
          </Button>
          <Button 
            id="sendMessageBtn" 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            <i className="ri-send-plane-fill"></i>
          </Button>
        </div>
        <div className="flex mt-2 justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <span>{t("chatbot.poweredBy")}</span>
          </div>
          <div className="flex items-center">
            <i className="ri-information-line mr-1"></i>
            <span>{t("chatbot.disclaimer")}</span>
          </div>
        </div>
      </div>
    </section>
  );
});

ChatbotAssistant.displayName = "ChatbotAssistant";

export default ChatbotAssistant;
