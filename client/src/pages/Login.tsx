import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, loginWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const Login = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLocation("/");
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeBack"),
        variant: "default",
      });
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: t("auth.loginError"),
        description: t("auth.tryAgain"),
        variant: "destructive",
      });
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

            <Button 
              variant="default"
              className="w-full flex items-center justify-center bg-red-500 text-white py-6 rounded-lg hover:bg-red-600 transition-colors shadow-md"
              onClick={handleLogin}
            >
              <i className="ri-google-fill text-2xl mr-3"></i>
              <span className="font-medium text-lg">{t("auth.signInWithGoogle")}</span>
            </Button>

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