"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [echo, setEcho] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const echoRef = useRef(null);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    try {
      // Make Pusher available globally
      window.Pusher = Pusher;

      // Initialize Laravel Echo
      const echoInstance = new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "local-key",
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) || 6001,
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) || 6001,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || "http") === "https",
        enabledTransports: ["ws", "wss"],
        disableStats: true,
      });

      echoRef.current = echoInstance;
      setEcho(echoInstance);

      // Connection event listeners
      echoInstance.connector.pusher.connection.bind("connected", () => {
        setIsConnected(true);
        setError(null);
      });

      echoInstance.connector.pusher.connection.bind("disconnected", () => {
        setIsConnected(false);
      });

      echoInstance.connector.pusher.connection.bind("error", (err) => {
        setError(err);
        setIsConnected(false);
      });
    } catch (err) {
      setError(err);
    }

    // Cleanup on unmount
    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
      }
    };
  }, []);

  const subscribe = (channelName, eventName, callback) => {
    if (!echo) {
      console.warn("Echo not initialized yet");
      return null;
    }

    console.log(
      `📡 Setting up listener for "${eventName}" on channel "${channelName}"`
    );

    const channel = echo.channel(channelName);

    // Debug: Log all events on this channel
    channel.listen(`.${eventName}`, (data) => {
      console.log(`📨 Event received: .${eventName}`, data);
      callback(data);
    });

    return () => {
      channel.stopListening(`.${eventName}`);
    };
  };

  const unsubscribe = (channelName) => {
    if (!echo) return;
    echo.leave(channelName);
  };

  const value = {
    echo,
    isConnected,
    error,
    subscribe,
    unsubscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
