"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [iframeUrl, setIframeUrl] = useState("");

  const fetchAydSession = () => {
    fetch("/api/ayd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        setIframeUrl(url);
      });
  };

  useEffect(() => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Development mode: directly fetch authenticated session
      fetchAydSession();
    } else {
      // Production mode: use original logic
      // Set initial iframe URL - this provides a default chatbot URL using the environment variable
      if (typeof window !== "undefined") {
        setIframeUrl(`https://www.askyourdatabase.com/chatbot/${process.env.AYD_CHATBOT_ID}`);
      }

      // Listen for messages from the iframe - this handles communication between the parent window and the embedded chatbot
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'LOGIN_SUCCESS') {
          // Login successful - update iframe URL with the authenticated session URL provided in the message
          setIframeUrl(event.data.url);
        } else if (event.data.type === 'LOGIN_REQUIRED') {
          // Login required - fetch a new authenticated session from our API endpoint
          fetchAydSession();
        }
      };

      if (typeof window !== "undefined") {
        window.addEventListener('message', handleMessage);
      }

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener('message', handleMessage);
        }
      };
    }
  }, []);

  return (
    <main>
      <iframe
        className="mx-auto"
        allow="clipboard-read; clipboard-write"
        style={{
          height: "100vh",
          width: "100vw",
          border: "none", // Optional - removes the default iframe border for a cleaner appearance
        }}
        src={iframeUrl}
      ></iframe>
    </main>
  );
}
