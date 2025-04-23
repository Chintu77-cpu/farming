import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, loginWithGoogle, handleRedirectResult } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const Login = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Handle the redirect result when the component mounts
    const processRedirect = async () => {
      try {
        setIsProcessing(true);
        const user = await handleRedirectResult();
        if (user) {
          toast({
            title: t("auth.loginSuccess"),
            description: t("auth.welcomeBack"),
            variant: "default",
          });
          setLocation("/");
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
        toast({
          title: t("auth.loginError"),
          description: t("auth.tryAgain"),
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processRedirect();

    // Redirect if already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLocation("/");
      }
    });

    return () => unsubscribe();
  }, [setLocation, t, toast]);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      await loginWithGoogle();
      // For redirect flow, this part may not execute as the page will reload
      // The success toast will be shown after the redirect in the useEffect
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: t("auth.loginError"),
        description: t("auth.tryAgain"),
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-primary text-5xl mb-4">
                <i className="ri-plant-line"></i>
              </div>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">
                {t("header.title")}
              </h1>
              <p className="text-gray-600">
                {t("auth.loginPrompt")}
              </p>
            </div>

            <div className="relative">
              <Button 
                variant="default"
                className="w-full flex items-center justify-center bg-white text-gray-700 py-6 rounded-lg hover:bg-gray-100 transition-colors shadow-md border border-gray-300"
                onClick={handleLogin}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium text-lg">{t("auth.processing")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-medium text-lg">{t("auth.signInWithGoogle")}</span>
                  </>
                )}
              </Button>
              <div className="absolute -top-4 right-0 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                Recommended
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>{t("auth.privacyNotice")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;