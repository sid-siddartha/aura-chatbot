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
    // 设置初始 iframe URL
    if (typeof window !== "undefined") {
      setIframeUrl(`https://www.askyourdatabase.com/chatbot/${process.env.AYD_CHATBOT_ID}`);
    }

    // 监听来自 iframe 的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGIN_SUCCESS') {
        // 登录成功，设置 iframe URL 为成功消息中的 URL
        setIframeUrl(event.data.url);
      } else if (event.data.type === 'LOGIN_REQUIRED') {
        // 需要登录，重新发起 ayd session 请求
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
  }, []);

  return (
    <main>
      <iframe
        className="mx-auto"
        style={{
          height: "100vh",
          width: "100vw",
          border: "none", // 可选，去掉边框
        }}
        src={iframeUrl}
      ></iframe>
    </main>
  );
}
