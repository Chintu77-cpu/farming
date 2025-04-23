import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  signInWithPopup,
  GoogleAuthProvider, 
  signOut,
  getRedirectResult 
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || ""}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  // Optional: If you are using Realtime Database
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
};

console.log("Firebase config:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Not set",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not set",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Set" : "Not set"
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// Detect if on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Login with Google
export const loginWithGoogle = async () => {
  try {
    // Use redirect for mobile and popup for desktop
    if (isMobile) {
      await signInWithRedirect(auth, provider);
      return null; // User info will be available after redirect
    } else {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
  } catch (error) {
    console.error("Error during Google sign in:", error);
    throw error;
  }
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect:", error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during sign out:", error);
    throw error;
  }
};

export { app, auth, database };
