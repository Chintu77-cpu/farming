import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FarmingTips from "@/pages/FarmingTips";
import WaterConservation from "@/pages/WaterConservation";
import SoilHealth from "@/pages/SoilHealth";
import Weather from "@/pages/Weather";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { apiRequest } from "./lib/queryClient";

function Router() {
  // Handle Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, create or get user in our database
        try {
          await apiRequest("post", "/api/auth/user", {
            uid: user.uid,
            displayName: user.displayName || null,
            email: user.email || null,
            photoURL: user.photoURL || null,
            preferredLanguage: "en" // Default language
          });
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/farming-tips" component={FarmingTips} />
          <Route path="/water-conservation" component={WaterConservation} />
          <Route path="/soil-health" component={SoilHealth} />
          <Route path="/weather" component={Weather} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
