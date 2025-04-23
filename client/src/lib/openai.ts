import { apiRequest } from "./queryClient";

// Function to send a message to the chatbot and get a response
export const sendChatMessage = async (userId: number, content: string) => {
  try {
    const response = await apiRequest("post", "/api/chat", {
      userId,
      role: "user",
      content
    });
    
    // Return the data from the response
    return await response.json();
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// Text to speech function using Web Speech API
export const textToSpeech = (text: string, lang: string = "en-US") => {
  if (!('speechSynthesis' in window)) {
    console.error("Text-to-speech not supported in this browser");
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language based on the current app language
  switch (lang) {
    case "hi":
      utterance.lang = "hi-IN";
      break;
    case "te":
      utterance.lang = "te-IN";
      break;
    default:
      utterance.lang = "en-US";
  }

  window.speechSynthesis.speak(utterance);
};

// Speech to text function using Web Speech API
export const speechToText = (
  onResult: (text: string) => void,
  onEnd: () => void,
  lang: string = "en-US"
) => {
  if (!('webkitSpeechRecognition' in window)) {
    console.error("Speech recognition not supported in this browser");
    return { start: () => {}, stop: () => {} };
  }

  // @ts-ignore - webkitSpeechRecognition is not in the TypeScript types
  const recognition = new window.webkitSpeechRecognition();
  
  // Set language based on the current app language
  switch (lang) {
    case "hi":
      recognition.lang = "hi-IN";
      break;
    case "te":
      recognition.lang = "te-IN";
      break;
    default:
      recognition.lang = "en-US";
  }

  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop()
  };
};
