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
        content: t("chatbot.welcome")
      }]);
    }
  }, [chatHistory, t]);

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

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    
    if (!userId) {
      toast({
        title: t("chatbot.loginRequired"),
        description: t("chatbot.pleaseLogin"),
        variant: "default",
      });
      return;
    }
    
    setIsLoading(true);
    sendMessageMutation.mutate(message);
    setMessage("");
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
