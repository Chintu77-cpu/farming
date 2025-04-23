import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");
  const [userId, setUserId] = useState<number | null>(null);

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
            // Set language preference if available
            if (userData.preferredLanguage) {
              setLanguage(userData.preferredLanguage);
              i18n.changeLanguage(userData.preferredLanguage);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [i18n]);

  const changeLanguage = async (newLanguage: string) => {
    setLanguage(newLanguage);
    await i18n.changeLanguage(newLanguage);
    
    // Save language preference if user is logged in
    if (userId) {
      try {
        await apiRequest("patch", `/api/users/${userId}/language`, { language: newLanguage });
        // Invalidate user cache
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  return (
    <div className="flex items-center mb-3 md:mb-0">
      <span className="text-secondary-dark mr-2">
        <i className="ri-translate-2"></i>
      </span>
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] bg-background-light border border-gray-300 text-gray-700 py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
