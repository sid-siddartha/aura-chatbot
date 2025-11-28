"use client";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/LoadingPage";

export default function Home() {
  const [iframeUrl, setIframeUrl] = useState(null);  // <— use null instead of empty string

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
      })
      .catch((err) => console.error("Failed to fetch AYD session:", err));
  };

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      fetchAydSession();
      return;
    }

    // Production logic
    if (typeof window !== "undefined") {
      setIframeUrl(
        `https://www.askyourdatabase.com/chatbot/${process.env.AYD_CHATBOT_ID}`
      );
    }

    const handleMessage = (event) => {
      if (event.data.type === "LOGIN_SUCCESS") {
        setIframeUrl(event.data.url);
      } else if (event.data.type === "LOGIN_REQUIRED") {
        fetchAydSession();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleMessage);
      }
    };
  }, []);

  return (
    <main>
      {iframeUrl ? (
        <iframe
          className="mx-auto"
          style={{
            height: "100vh",
            width: "100vw",
            border: "none",
          }}
          src={iframeUrl}
        ></iframe>
      ) : (
        <LoadingPage />
      )}
    </main>
  );
}
