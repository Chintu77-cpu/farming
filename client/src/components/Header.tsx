import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { auth, loginWithGoogle, logout } from "@/lib/firebase";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    // Redirect to login page instead of showing popup directly
    setLocation("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t("auth.logoutSuccess"),
        description: t("auth.seeYouSoon"),
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t("auth.logoutError"),
        description: t("auth.tryAgain"),
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center mb-3 md:mb-0">
            <div className="mr-2 text-primary">
              <i className="ri-plant-line text-4xl"></i>
            </div>
            <h1 className="font-bold text-xl md:text-2xl text-primary-dark">
              {t("header.title")}
            </h1>
          </div>

          {/* Language Selector */}
          <LanguageSelector />

          {/* User Menu / Login */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center">
                <div className="mr-3">
                  <p className="text-sm font-semibold text-gray-700">{user.displayName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="relative">
                  <img 
                    src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName} 
                    alt="User avatar" 
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  />
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                    <i 
                      className="ri-logout-circle-r-line text-sm text-secondary cursor-pointer" 
                      onClick={handleLogout}
                    ></i>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                variant="default"
                className="flex items-center bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                onClick={handleLogin}
              >
                <i className="ri-google-fill text-lg mr-3"></i>
                <span className="font-medium">{t("auth.signInWithGoogle")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-2">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-6">
            <li>
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.home")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/farming-tips">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/farming-tips" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.farmingTips")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/water-conservation">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/water-conservation" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.waterConservation")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/soil-health">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/soil-health" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.soilHealth")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/weather">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/weather" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.weather")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a className={`px-3 py-2 text-sm font-medium ${location === "/about" ? "text-primary-dark border-b-2 border-primary" : "text-gray-600 hover:text-primary border-b-2 border-transparent hover:border-primary-light"}`}>
                  {t("nav.about")}
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
