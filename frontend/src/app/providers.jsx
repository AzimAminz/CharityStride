"use client";

import { LanguageProvider } from "./contexts/LanguageContext";
import { WebSocketProvider } from "./contexts/WebSocketProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <LanguageProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
